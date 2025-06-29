import pkgutil
import importlib
import sys
import app.database.models
from app.database.db import Base, engine

def import_models():
    package = app.database.models
    for _, module_name, is_pkg in pkgutil.iter_modules(package.__path__):
        if not is_pkg:
            module_import_path = f"{package.__name__}.{module_name}"
            if module_import_path not in sys.modules:
                importlib.import_module(module_import_path)

import_models()

Base.metadata.create_all(bind=engine)
print("База даних успішно ініціалізована!")
