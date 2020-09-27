FROM alpine:latest

WORKDIR /opt/converter

EXPOSE 8080

RUN apk add --update --no-cache ffmpeg zip && \
    mkdir -p /opt/converter/static/files && \
    mkdir /lib64 && \
    ln -s /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2


ADD converter converter
ADD ./static/html static/html
ADD ./static/js static/js
ADD ./static/css static/css

CMD ["/opt/converter/converter"]
