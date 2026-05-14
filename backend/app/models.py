from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Date, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BudgetCycle(Base):
    __tablename__ = "budget_cycles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    salary_amount: Mapped[float] = mapped_column(Float, nullable=False)
    total_budget: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="budget_cycle")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    color: Mapped[str] = mapped_column(String(20), nullable=False, default="#6366f1")
    icon: Mapped[str] = mapped_column(String(50), nullable=False, default="tag")
    budget_limit: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    is_system: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="category")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(200), primary_key=True)
    account_id: Mapped[str] = mapped_column(String(200), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="EUR")
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    booking_date: Mapped[str] = mapped_column(String(20), nullable=False)
    value_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    category_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("categories.id"), nullable=True)
    budget_cycle_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("budget_cycles.id"), nullable=True)
    is_expense: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    tx_type: Mapped[str] = mapped_column(String(20), nullable=False, default="expense")
    raw_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    category: Mapped[Optional["Category"]] = relationship("Category", back_populates="transactions")
    budget_cycle: Mapped[Optional["BudgetCycle"]] = relationship("BudgetCycle", back_populates="transactions")


class AppConfig(Base):
    __tablename__ = "app_config"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[str] = mapped_column(Text, nullable=False, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class GocardlessToken(Base):
    __tablename__ = "gocardless_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    access_token: Mapped[str] = mapped_column(Text, nullable=False)
    refresh_token: Mapped[str] = mapped_column(Text, nullable=False)
    access_expires: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    refresh_expires: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
