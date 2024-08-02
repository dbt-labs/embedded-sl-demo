FROM python:3.12-bookworm AS prod 

WORKDIR /usr/app

COPY deps/ deps/

RUN pip install -r deps/runtime.lock

COPY src/ src/

ENV WORKERS=4
ENV PORT=80

CMD uvicorn src.app:app --host 0.0.0.0 --port $PORT --workers $WORKERS



FROM prod AS dev

RUN pip install debugpy

ENV DEBUG_PORT=5678

CMD python -Xfrozen_modules=off -m debugpy --listen $DEBUG_PORT -m uvicorn src.app:app --host 0.0.0.0 --port $PORT --reload
