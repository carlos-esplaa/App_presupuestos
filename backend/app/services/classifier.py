from dataclasses import dataclass

SALARY_KEYWORDS = ["NOMINA", "NÓMINA", "SALARIO", "SUELDO", "REMUNERACION"]
SAVINGS_KEYWORDS = ["TRASPASO", "MYINVESTOR", "CUENTA AHORRO", "AHORRO", "TRANSFERENCIA AHORRO", "INDEXA"]
GROCERY_KEYWORDS = ["MERCADONA", "LIDL", "ALDI", "CARREFOUR", "DIA ", "EROSKI", "CONSUM", "ALCAMPO", "SUPERCOR", "EL CORTE INGLES ALIM"]
TRANSPORT_KEYWORDS = ["RENFE", "EMT ", "METRO ", "CABIFY", "UBER", "BLABLACAR", "REPSOL", "BP ", "CEPSA", "GALP", "PARKING", "AUTOPISTA", "PEAJE"]
LEISURE_KEYWORDS = ["NETFLIX", "SPOTIFY", "HBO", "AMAZON PRIME", "CINE ", "CINEMA", "DISNEY", "STEAM", "APPLE.COM/BILL", "GOOGLE PLAY"]
HEALTH_KEYWORDS = ["FARMACIA", "CLINICA", "MEDICO", "MÉDICO", "SANITAS", "ADESLAS", "MAPFRE SALUD", "DENTISTA", "DOCTOR"]
UTILITIES_KEYWORDS = ["ENDESA", "IBERDROLA", "NATURGY", "ORANGE", "MOVISTAR", "VODAFONE", "JAZZTEL", "GAS NATURAL", "AGUAS", "COMUNIDAD"]


@dataclass
class ClassificationResult:
    category_name: str
    is_expense: bool
    tx_type: str


def _contains(text: str, keywords: list[str]) -> bool:
    upper = text.upper()
    return any(kw in upper for kw in keywords)


def classify(amount: float, description: str, salary_min: float = 1500.0) -> ClassificationResult:
    desc = description or ""

    if amount > salary_min and _contains(desc, SALARY_KEYWORDS):
        return ClassificationResult("Salary", False, "income")

    if amount > 0 and not _contains(desc, SALARY_KEYWORDS):
        # Any positive that isn't a recognized salary → treat as income/transfer
        if _contains(desc, SAVINGS_KEYWORDS):
            return ClassificationResult("Savings", False, "savings")
        return ClassificationResult("Salary", False, "income")

    if _contains(desc, SAVINGS_KEYWORDS):
        return ClassificationResult("Savings", False, "savings")

    if _contains(desc, GROCERY_KEYWORDS):
        return ClassificationResult("Alimentación", True, "expense")

    if _contains(desc, TRANSPORT_KEYWORDS):
        return ClassificationResult("Transporte", True, "expense")

    if _contains(desc, LEISURE_KEYWORDS):
        return ClassificationResult("Ocio", True, "expense")

    if _contains(desc, HEALTH_KEYWORDS):
        return ClassificationResult("Salud", True, "expense")

    if _contains(desc, UTILITIES_KEYWORDS):
        return ClassificationResult("Hogar", True, "expense")

    return ClassificationResult("Otros", True, "expense")
