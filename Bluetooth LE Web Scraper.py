# -*- coding: utf-8 -*-
"""
Created on Tue Oct 27 01:55:49 2020

@author: Christian
"""


import os, time
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from pynput.keyboard import Key, Controller

keyboard = Controller()

capabilities = DesiredCapabilities.CHROME
capabilities['goog:loggingPrefs'] = { 'browser':'ALL' }

driver = webdriver.Chrome(desired_capabilities=capabilities, executable_path=r'chromedriver.exe')

html_location = os.path.dirname(os.path.abspath(__file__)) + "/index.html"
driver.get(html_location)

dic_go = {"U": "q",
       "U'": "w",
       "D": "e",
       "D'": "r",
       "R": "t",
       "R'": "y",
       "L": "u",
       "L'": "i",
       "F": "o",
       "F'": "p",
       "B": "a",
       "B'": "s"
       }

dic_gi = {"U": "d",
       "U'": "f",
       "D": "g",
       "D'": "h",
       "R": "j",
       "R'": "k",
       "L": "l",
       "L'": "z",
       "F": "x",
       "F'": "c",
       "B": "v",
       "B'": "b"
       }

dics = {"GO": dic_go, "GI": dic_gi}

pressed_keys = {}
press_length = 0.1

def updateKeys():
    for key, val in pressed_keys.copy().items():
        if time.time() > val + press_length:
            keyboard.release(key)
            del pressed_keys[key]

while True:
    for entry in driver.get_log('browser'):
        try:
            entry = str(entry).split('"')[1].split(";")
            key = dics[entry[1]][entry[0].replace("\\", "")]
            keyboard.press(key)
            pressed_keys[key] = time.time()
        except:
            pass

    updateKeys()
