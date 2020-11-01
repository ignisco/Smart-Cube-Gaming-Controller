# -*- coding: utf-8 -*-
"""
Created on Tue Oct 27 01:55:49 2020

@author: Christian
"""


import os, time
from directinput import press_key, release_key, CHAR_MAP
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

capabilities = DesiredCapabilities.CHROME
capabilities['goog:loggingPrefs'] = { 'browser':'ALL' }

driver = webdriver.Chrome(desired_capabilities=capabilities, executable_path=r'chromedriver.exe')

html_location = os.path.dirname(os.path.abspath(__file__)) + "/index.html"
driver.get(html_location)

class Key:
    def __init__(self, value, toggle, press_length=0.1, cancel_keys=[]):
        self.value = value
        self.toggle = toggle
        self.press_length = press_length
        self.cancel_keys = cancel_keys

down1 = Key("s", True, cancel_keys=["s", "g"])
down2 = Key("k", True, cancel_keys=["i", "k"])

dic_go = {"U": Key("a", True, cancel_keys=["a", "d"]),
       "U'": Key("d", True, cancel_keys=["a", "d"]),
       "D": down1,
       "D'": down1,
       "R": Key("g", False, press_length=0.1),
       "R'": Key("g", False, press_length=0.1),
       "L": Key("s", False, press_length=0.1),
       "L'": Key("h", False, press_length=0.1),
       "F": Key("f", False, press_length=0.1),
       "F'": Key("f", False, press_length=0.1),
       # "B": "a",
       # "B'": "s"
       }

sekiro = {
        "U": Key("d", True, cancel_keys=["a", "d", "l"]),
        "U'": Key("a", True, cancel_keys=["a", "d", "l"]),
        "D": Key("r", False, press_length=0.1),
        "D'": Key("x", False, press_length=0.1),
        "R": Key("w", True, cancel_keys=["s", "w", "l"]),
        "R'": Key("s", True, cancel_keys=["s", "w", "l"]),
        "L": Key("l", False, press_length=0.1),
        "L'": Key("space", False, press_length=0.1),
        "F": Key("i", False, press_length=0.1),
        "F'": Key("o", False, press_length=0.1),
        "B": Key("o", True, cancel_keys=["o", "i", "l"]),
        "B'": Key("n", True, cancel_keys=["n"]),
        }

dic_gi = {"U": Key("j", True, cancel_keys=["j", "l"]),
       "U'": Key("l", True, cancel_keys=["j", "l"]),
       "D": down2,
       "D'": down2,
       "R": Key("i", False, press_length=0.1),
       "R'": Key("i", False, press_length=0.1),
       "L": Key("k", False, press_length=0.1),
       "L'": Key("n", False, press_length=0.1),
       "F": Key("m", False, press_length=0.1),
       "F'": Key("m", False, press_length=0.1),
       # "B": "v",
       # "B'": "b"ksa
       }

dics = {"GO": dic_go, "GI": dic_gi}

pressed_keys = {}

def updateKeys():
    for key, val in pressed_keys.copy().items():
        if not key.toggle:
            if time.time() > val + key.press_length:
                release_key(CHAR_MAP[key.value])
                del pressed_keys[key]

while True:
    for entry in driver.get_log('browser'):
        try:
            entry = str(entry).split('"')[1].split(";")
            new_key = sekiro[entry[0].replace("\\", "")]
            old_pressed_keys = pressed_keys.copy()  # Used to prevent toggle key from toggling itself off immediately
            pressed_keys[new_key] = time.time()

            # Check if new_key is in cancel_keys of already toggled keys
            for key in old_pressed_keys:
                if new_key.value in key.cancel_keys:
                    release_key(CHAR_MAP[key.value])
                    del pressed_keys[key]

            if new_key not in old_pressed_keys:
                press_key(CHAR_MAP[new_key.value])
        except:
            pass

    updateKeys()
