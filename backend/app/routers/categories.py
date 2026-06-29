from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.deps import get_db
from app.models import Category
from app.schemas import CategoryCreate, CategoryOut, CategoryUpdate
from app.services.budget_service import get_current_cycle, get_cycle_spending_by_category

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db), _: str = Depends(get_current_user)):
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
def create_category(body: CategoryCreate, db: Session = Depends(get_db), _: str = Depends(get_current_user)):
    existing = db.query(Category).filter(Category.name == body.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Categoría ya existe")
    cat = Category(name=body.name, color=body.color, icon=body.icon, budget_limit=body.budget_limit)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return CategoryOut(id=cat.id, name=cat.name, color=cat.color, icon=cat.icon,
                       budget_limit=cat.budget_limit, is_system=cat.is_system, spent=0.0, percent=0.0)


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    body: CategoryUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user),
):
    """Editar nombre, color, icono o límite de una categoría existente."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    if cat.is_system:
        raise HTTPException(status_code=403, detail="Las categorías del sistema no se pueden modificar")

    if body.name is not None:
        # Verificar que el nuevo nombre no colisione con otra
        other = db.query(Category).filter(Category.name == body.name, Category.id != category_id).first()
        if other:
            raise HTTPException(status_code=409, detail="Ya existe una categoría con ese nombre")
        cat.name = body.name
    if body.color is not None:
        cat.color = body.color
    if body.icon is not None:
        cat.icon = body.icon
    if body.budget_limit is not None:
        cat.budget_limit = body.budget_limit

    db.commit()
    db.refresh(cat)
    return CategoryOut(id=cat.id, name=cat.name, color=cat.color, icon=cat.icon,
                       budget_limit=cat.budget_limit, is_system=cat.is_system, spent=0.0, percent=0.0)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user),
):
    """Eliminar una categoría de usuario. Las transacciones quedan sin categoría."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    if cat.is_system:
        raise HTTPException(status_code=403, detail="Las categorías del sistema no se pueden eliminar")
    db.delete(cat)
    db.commit()
