#-*- coding: utf-8 -*-

from icrawler.builtin import GoogleImageCrawler
from datetime import date
import boto3
import os
import os.path
import sys

# Fill these in - you get them when you sign up for S3
AWS_ACCESS_KEY_ID = '' # Need To Insert or Use Env variables
AWS_ACCESS_KEY_SECRET = '' # Need To Insert or Use Env variables
# Fill in info on data to upload
# destination bucket name

BUCKET_NAME = None
TABLE_NAME = None
REGION = None

if os.environ.get('BUCKET_NAME') is not None:
    BUCKET_NAME = os.environ['BUCKET_NAME']
else:
    BUCKET_NAME = "crawl-google-dev"

print("bucket name is" + BUCKET_NAME)

if os.environ.get('DYNAMODB_TABLE') is not None:
    TABLE_NAME = os.environ['DYNAMODB_TABLE']
else:
    TABLE_NAME = "crawl-google-dev"

if os.environ.get('REGION') is not None:
    REGION = os.environ.get('REGION')
else:
    REGION = 'ap-northeast-2'

#max size in bytes before uploading in parts. between 1 and 5 GB recommended
MAX_SIZE = 50 * 1000 * 1000
#size of parts when uploading in parts
PART_SIZE = 6 * 1000 * 1000

# Let's use Amazon S3
s3 = boto3.resource('s3')

# Lets use Amazon DynamoDB
dynamo = boto3.client('dynamodb', region_name=REGION)

# Use Bucket
bucket = s3.Bucket(BUCKET_NAME)

uploadFileNames = []

def percent_cb(complete, total):
    sys.stdout.write('.')
    sys.stdout.flush()

def upload(sourceDir, destDir):
    print('Upload Started')
    print('destDir: ' + destDir)
    for (sourceDir, dirname, filename) in os.walk(sourceDir):
        uploadFileNames.extend(filename)
        break

    print(uploadFileNames)

    for filename in uploadFileNames:
        try:
                sourcepath = os.path.join(sourceDir + filename)
                print('sourcepath: ' + sourcepath)
                print('destDir/filename: '+ destDir+'/'+filename)
                bucket.upload_file(sourcepath, destDir+'/'+filename)
        except:
            print("upload error")

def recordingStateToDynamoDB(keyword, years):
    return dynamo.put_item(
        TableName = TABLE_NAME,
        Item = {
            'years': {
                'S': years
            },
            'keyword': {
                'S': keyword
            }
        }
    )
    print("recordingStateToDynamoDB excecuted successfully")

def removeStateToDynamoDB(keyword, years):
    return dynamo.delete_item(
        TableName= TABLE_NAME,
        Key = {
            'years': {
                'S': years
            },
            'keyword': {
                'S': keyword
            }
        })

def crawl(event, context):
    startYearStr = event['startYear'];
    print("startYear: " + str(int(startYearStr)))
    search_keyword=str(event['keyword']) # searching keyword
    filters = dict(
        date=((int(startYearStr), 1, 1), (int(startYearStr), 12, 31)),
    )
    google_crawler = GoogleImageCrawler(parser_threads=2, downloader_threads=4, storage={'root_dir': '/tmp/Google_'+startYearStr})
    google_crawler.crawl(keyword=search_keyword, max_num=1000, filters = filters)

    # Upload
    # source directory
    sourceDir = '/tmp/Google_'+startYearStr+'/'
    # destination directory name (on s3)
    destDir = search_keyword + '/Google_' + startYearStr
    upload(sourceDir, destDir)
    recordingStateToDynamoDB(search_keyword, startYearStr)