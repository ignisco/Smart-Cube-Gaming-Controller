# -*- coding: utf-8 -*-
"""
Created on Tue Oct 27 01:55:49 2020

@author: Christian
"""


import os
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from pynput.keyboard import Key, Controller

keyboard = Controller()

capabilities = DesiredCapabilities.CHROME
capabilities['goog:loggingPrefs'] = { 'browser':'ALL' }

driver = webdriver.Chrome(desired_capabilities=capabilities, executable_path=r'chromedriver.exe')

html_location = os.path.dirname(os.path.abspath(__file__)) + "/index.html"
driver.get(html_location)

dic = {"U": "H",
       "U'": "E",
       "R": "L",
       "R'": "O",
       "D": " ",
       "D'": "\b",
       "F": "f"
       }


while True:
    for entry in driver.get_log('browser'):
        try:
            entry = str(entry).split('"')[1][7:]
            entry = entry.replace("\\", "")
            keyboard.press(dic[entry])

        except:
            pass
