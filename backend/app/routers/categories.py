from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models import Category
from app.schemas import CategoryCreate, CategoryOut
from app.services.budget_service import get_current_cycle, get_cycle_spending_by_category

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.is_system.desc(), Category.name).all()
    cycle = get_current_cycle(db)
    spending = get_cycle_spending_by_category(db, cycle.id) if cycle else {}

    out = []
    for c in categories:
        spent = spending.get(c.id, 0.0)
        pct = round((spent / c.budget_limit * 100) if c.budget_limit > 0 else 0.0, 1)
        out.append(CategoryOut(
            id=c.id, name=c.name, color=c.color, icon=c.icon,
            budget_limit=c.budget_limit, is_system=c.is_system,
            spent=round(spent, 2), percent=pct,
        ))
    return out


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(body: CategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(Category).filter(Category.name == body.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Categoría ya existe")
    cat = Category(name=body.name, color=body.color, icon=body.icon, budget_limit=body.budget_limit)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return CategoryOut(id=cat.id, name=cat.name, color=cat.color, icon=cat.icon,
                       budget_limit=cat.budget_limit, is_system=cat.is_system, spent=0.0, percent=0.0)
