import os
import ctypes
import win32api

PUL = ctypes.POINTER(ctypes.c_ulong)

#Character codes for different letters
CHAR_MAP = {
    '1': 2,
    '2': 3,
    '3': 4,
    '4': 5,
    '5': 6,
    '6': 7,
    '7': 8,
    '8': 9,
    '9': 10,
    '0': 11,
    '-': 12,
    '=': 13,
    'tab': 15,
    'q': 16,
    'w': 17,
    'e': 18,
    'r': 19,
    't': 20,
    'y': 21,
    'u': 22,
    'i': 23,
    'o': 24,
    'p': 25,
    '[': 26,
    ']': 27,
    'a': 30,
    's': 31,
    'd': 32,
    'f': 33,
    'g': 34,
    'h': 35,
    'j': 36,
    'k': 37,
    'l': 38,
    ';': 39,
    "'": 40,
    '\\': 43,
    'z': 44,
    'x': 45,
    'c': 46,
    'v': 47,
    'b': 48,
    'n': 49,
    'm': 50,
    ',': 51,
    '.': 52,
    '/': 53,
    'f1': 59,
    'f2': 60,
    'f3': 61,
    'f4': 62,
    'f5': 63,
    'f6': 64,
    'f7': 65,
    'f8': 66,
    'f9': 67,
    'f10': 68,
    'f11': 87,
    'f12': 88,
    'scroll lock (f15)': 70,
    'esc': 1,
    'return': 28,
    'enter': 28,
    'space': 57,
    'insert': 210,
    'delete': 211,
    'backspace': 14,
    'left arrow': 203,
    'right arrow': 205,
    'up arrow': 200,
    'down arrow': 208,
    'home': 199,
    'end': 207,
    'page up': 201,
    'page down': 209,
    "numlock toggle, using 'clear' button": 69,
    'numeric =, just use normal equals': 13,
    'numeric /': 181,
    'numeric *': 55,
    'numeric -': 74,
    'numeric +': 78,
    'numeric .': 83,
    'numeric 0': 82,
    'numeric 1': 79,
    'numeric 2': 80,
    'numeric 3': 81,
    'numeric 4': 75,
    'numeric 5': 76,
    'numeric 6': 77,
    'numeric 7': 71,
    'numeric 8': 72,
    'numeric 9': 73,
    'numeric enter': 156
}

class KeyBdInput(ctypes.Structure):
   _fields_ = [("wVk", ctypes.c_ushort),
               ("wScan", ctypes.c_ushort),
               ("dwFlags", ctypes.c_ulong),
               ("time", ctypes.c_ulong),
               ("dwExtraInfo", PUL)]


class HardwareInput(ctypes.Structure):
   _fields_ = [("uMsg", ctypes.c_ulong),
               ("wParamL", ctypes.c_short),
               ("wParamH", ctypes.c_ushort)]


class MouseInput(ctypes.Structure):
   _fields_ = [("dx", ctypes.c_long),
               ("dy", ctypes.c_long),
               ("mouseData", ctypes.c_ulong),
               ("dwFlags", ctypes.c_ulong),
               ("time", ctypes.c_ulong),
               ("dwExtraInfo", PUL)]


class Input_I(ctypes.Union):
   _fields_ = [("ki", KeyBdInput),
               ("mi", MouseInput),
               ("hi", HardwareInput)]


class Input(ctypes.Structure):
   _fields_ = [("type", ctypes.c_ulong), ("ii", Input_I)]

def press_key(key):
   extra = ctypes.c_ulong(0)
   ii_ = Input_I()

   flags = 0x0008

   ii_.ki = KeyBdInput(0, key, flags, 0, ctypes.pointer(extra))
   x = Input(ctypes.c_ulong(1), ii_)
   ctypes.windll.user32.SendInput(1, ctypes.pointer(x), ctypes.sizeof(x))

def release_key(key):
   extra = ctypes.c_ulong(0)
   ii_ = Input_I()

   flags = 0x0008 | 0x0002

   ii_.ki = KeyBdInput(0, key, flags, 0, ctypes.pointer(extra))
   x = Input(ctypes.c_ulong(1), ii_)
   ctypes.windll.user32.SendInput(1, ctypes.pointer(x), ctypes.sizeof(x))
