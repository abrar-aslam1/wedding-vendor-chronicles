#!/usr/bin/env python3
"""
Debug script to check the last Apify run results
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def check_last_run():
    """Check the results of the last Apify run"""
    
    token = os.getenv('APIFY_TOKEN')
    base_url = "https://api.apify.com/v2"
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get recent runs
    runs_url = f"{base_url}/acts/shu8hvrXbJbY3Eb9W/runs?limit=5"
    
    try:
        response = requests.get(runs_url, headers=headers)
        response.raise_for_status()
        
        runs_data = response.json()
        
        if runs_data['data']['items']:
            latest_run = runs_data['data']['items'][0]
            
            print(f"Latest run ID: {latest_run['id']}")
            print(f"Status: {latest_run['status']}")
            print(f"Started: {latest_run['startedAt']}")
            print(f"Finished: {latest_run.get('finishedAt', 'Still running')}")
            
            if latest_run['status'] == 'SUCCEEDED':
                # Get dataset
                dataset_id = latest_run['defaultDatasetId']
                dataset_url = f"{base_url}/datasets/{dataset_id}/items"
                
                dataset_response = requests.get(dataset_url, headers=headers)
                items = dataset_response.json()
                
                print(f"\nDataset items found: {len(items)}")
                
                if items:
                    print("\nSample item structure:")
                    sample = items[0]
                    for key, value in sample.items():
                        if isinstance(value, str) and len(value) > 100:
                            print(f"  {key}: {value[:100]}...")
                        else:
                            print(f"  {key}: {value}")
                else:
                    print("No items in dataset - this might explain why 0 profiles were processed")
            else:
                print(f"Run not successful: {latest_run.get('statusMessage', 'Unknown error')}")
        else:
            print("No runs found")
            
    except Exception as e:
        print(f"Error checking run: {e}")

if __name__ == "__main__":
    check_last_run()