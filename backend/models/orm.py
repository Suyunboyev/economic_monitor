"""
models/orm.py — SQLAlchemy ORM table definitions
"""
from datetime import date, datetime
from typing import Optional

from sqlalchemy import (
    BigInteger,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.session import Base


class Indicator(Base):
    __tablename__ = "indicators"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    source: Mapped[Optional[str]] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    values: Mapped[list["IndicatorValue"]] = relationship(
        "IndicatorValue", back_populates="indicator", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Indicator(name={self.name!r})>"


class IndicatorValue(Base):
    __tablename__ = "indicator_values"

    __table_args__ = (
        UniqueConstraint("indicator_id", "date", name="uq_indicator_date"),
        Index("idx_iv_indicator_id", "indicator_id"),
        Index("idx_iv_date", "date"),
        Index("idx_iv_id_date", "indicator_id", "date"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    indicator_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("indicators.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[float] = mapped_column(Numeric(20, 6), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    raw_data: Mapped[Optional[dict]] = mapped_column(JSONB)

    indicator: Mapped["Indicator"] = relationship("Indicator", back_populates="values")

    def __repr__(self) -> str:
        return f"<IndicatorValue(indicator_id={self.indicator_id}, date={self.date}, value={self.value})>"