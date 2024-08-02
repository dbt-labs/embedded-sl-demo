FROM python:3.12-bookworm

WORKDIR /usr/app

COPY deps/ deps/

RUN pip install -r deps/runtime.lock

COPY src/ src/

ENV WORKERS=4
ENV PORT=80

CMD uvicorn src.app:app --port $PORT --workers $WORKERS
