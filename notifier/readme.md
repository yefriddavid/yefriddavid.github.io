```

gvm use go1.22
crontab -e


go run main.go -creds ../service-account.json -run-now --force
go run main.go -creds service-account.json -run-now --force
go run main.go -creds service-account.json -run-now

go build -o ./service-notify-pico-y-placa main.go


sudo systemctl restart cron

```


supervisor

[program:pico-y-placa]
command=/mnt/Zeus/Workspace/me/sources/My-Admin/notifier/service-notify-pico-y-placa -creds /mnt/Zeus/Workspace/me/sources/My-Admin/notifier/service-account.json
directory=/usr/local/bin
#directory=/mnt/Zeus/Workspace/me/sources/My-Admin/notifier
autostart=true
autorestart=true
startretries=1
stderr_logfile=/var/log/dave/pico-y-placa.err.log
stdout_logfile=/var/log/dave/pico-y-placa.out.log
user=traze


