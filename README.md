# Converter
wavファイルをmp3ファイルにタグ付きで変換するアプリケーション

!!**注意 Caution!!**
認証なしでファイルを受け付けるのでローカルネットワークで使うこと
Use only local network, because upload file without authentication.

## How to build
```
$ make init build build-container
```

## How to usage
```
$ docker run -d -p 8080:8080 converter
```
