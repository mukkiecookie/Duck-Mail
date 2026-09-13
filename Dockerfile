FROM python:3.11-slim

# Install a C++ compiler (Linux equivalent of what you installed on Windows)
RUN apt-get update && apt-get install -y g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Build the C++ engine for Linux
RUN python setup.py build_ext --inplace

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]