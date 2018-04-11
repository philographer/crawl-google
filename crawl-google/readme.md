## How to use
```bash
# this should be typed on AWS EC2 Environment.
# because of `pip install` keyword install depending on the environment of your computer
$ pip install -r requirements.txt -t . # on ec2
$ zip -r foo.zip . # on ec2
$ scp -i heartbeat.pem ubuntu@13.125.163.183:/home/ubuntu/lambda2/foo.zip . # on local
# and you can upload zip file to lambda
```

## ref
- [python - aws - “Unable to import module ‘process’: /var/task/numpy/core/multiarray.so: invalid ELF header” - Stack Overflow](https://stackoverflow.com/questions/34881240/aws-unable-to-import-module-process-var-task-numpy-core-multiarray-so-in)
