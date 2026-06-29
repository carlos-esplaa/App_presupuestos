#!/usr/bin/env python3
"""
Utilidad para generar las credenciales iniciales de la app.

Uso:
    python generate_credentials.py

Pega los valores generados en tu archivo backend/.env
"""
import secrets
import sys


def main():
    try:
        from passlib.context import CryptContext
    except ImportError:
        print("Instala las dependencias primero: pip install passlib[bcrypt]")
        sys.exit(1)

    print("=" * 60)
    print("  Generador de credenciales — Presupuesto Personal")
    print("=" * 60)

    # SECRET_KEY
    secret_key = secrets.token_hex(32)
    print(f"\nSECRET_KEY={secret_key}")

    # Password hash
    password = input("\nIntroduce la contraseña que quieres usar: ").strip()
    if not password:
        print("La contraseña no puede estar vacía")
        sys.exit(1)

    ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed = ctx.hash(password)
    print(f"\nAPP_PASSWORD_HASH={hashed}")

    print("\n" + "=" * 60)
    print("Copia estas dos líneas a tu backend/.env")
    print("=" * 60)


if __name__ == "__main__":
    main()
