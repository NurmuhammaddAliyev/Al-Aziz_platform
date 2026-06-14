Al-Aziz Platform

Qisqacha: Django backend va React (Vite) frontend bilan ta'minlangan ta'lim platformasi.

Tez boshlash:

1. Virtual muhit yaratish

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

2. Postgres konfiguratsiyasi: `bacend/config/settings.py` ichida `DATABASES` sozlamalarini to'ldiring.

3. Migratsiyalarni bajarish

```powershell
python bacend/manage.py migrate
python bacend/manage.py createsuperuser
python bacend/manage.py runserver
```

Frontend ishga tushirish:

```powershell
cd frontend
npm install
npm run dev
```

Eslatma:
- Maxfiy ma'lumotlarni `.env` yoki GitHub Secrets-ga saqlang; repoga hech qachon `db.sqlite3`, `.env` yoki `venv/` qo'ymang.
- Qo'shimcha: `requirements.txt` mavjud bo'lmasa `pip freeze > requirements.txt` bilan yarating.