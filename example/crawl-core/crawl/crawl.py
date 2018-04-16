#-*- coding: utf-8 -*-

from icrawler.builtin import GoogleImageCrawler
from datetime import date
import boto3
import os
import os.path
import sys

# Korean Directory Name
reload(sys)
sys.setdefaultencoding('utf-8')

# Fill these in - you get them when you sign up for S3
AWS_ACCESS_KEY_ID = '' # Need To Insert or Use Env variables
AWS_ACCESS_KEY_SECRET = '' # Need To Insert or Use Env variables
# Fill in info on data to upload
# destination bucket name
bucket_name = 'crawl-google'

#max size in bytes before uploading in parts. between 1 and 5 GB recommended
MAX_SIZE = 50 * 1000 * 1000
#size of parts when uploading in parts
PART_SIZE = 6 * 1000 * 1000

# Let's use Amazon S3
s3 = boto3.resource('s3')

# Use Bucket
bucket = s3.Bucket(bucket_name)

uploadFileNames = []

def percent_cb(complete, total):
    sys.stdout.write('.')
    sys.stdout.flush()

def upload(sourceDir, destDir):
    print 'Upload Started'
    print 'destDir: ' + destDir
    for (sourceDir, dirname, filename) in os.walk(sourceDir):
        uploadFileNames.extend(filename)
        break

    print uploadFileNames

    for filename in uploadFileNames:
	try:
            sourcepath = os.path.join(sourceDir + filename)
            print 'sourcepath: '+sourcepath
            bucket.upload_file(sourcepath, destDir+'/'+filename)
	except:
	    print "upload error"

def recordingStateToDynamoDB(keyword, years):
    # Let's use Amazon DynamoDB
    dynamo = boto3.client('dynamodb')
    dynamo.put_item(
        TableName = os.environ['DYNAMODB_TABLE'],
        Item = {
            'years': {
                'S': years
            },
            'keyword': {
                'S': keyword
            }
        }
    )
    print "recordingStateToDynamoDB excecuted successfully"

def crawl(event, context):
    startYearStr = event['startYear'];
    print "startYear: " + str(int(startYearStr))
    search_keyword=str(unicode(event['keyword'])) # searching keyword
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