import sys
from pymongo import MongoClient
import json
from pandas.io.json import json_normalize
from Processor import Processor
from DataHandler import DataHandler
from pathlib import Path

processor = Processor()
args = sys.argv
username = args[1]
jobId = args[2]

client = MongoClient()
db = client.bpexplorer_users
jobs = db.jobs

job = jobs.find_one({"username": username, "id": jobId})

with open(Path(job['state'])) as stateFile:
    state = json.load(stateFile)

with open(Path(job['input'])) as inputFile:
    input = json.load(inputFile)

with open(Path(job['dataPath'])) as dataFile:
    rawData = json.load(dataFile)

with open(Path(job['schemaPath'])) as schemaFile:
    rawSchema = json.load(schemaFile)

with open(Path(job['codePath'])) as codeFile:
    code = codeFile.read()

dataList = [json_normalize(rawData, key) for key in sorted(rawData.keys())]
schemaList = [rawSchema[key] for key in sorted(rawSchema.keys())]

for i, schema in enumerate(schemaList):
    dataList[i].columns = schema.keys()

source_code = ('\t'.join(('\n' + code.lstrip()).splitlines(True)))
dh = DataHandler(dataList, schemaList)

processor.process(input, state, dh, code)
