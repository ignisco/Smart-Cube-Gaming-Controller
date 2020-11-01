# Smart Cube Gaming Controller

## Quick Overview

This project utilizes the Web Bluetooth API to establish a connection with various smart cubes (Rubiks cube BLE devices) in
combination with various python modules to emulate keystrokes, effectively enabling you to use the smart cube as a gaming controller.


The program is capable of reading code from multiple cubes simultaneously and inputs (turns on the cube) can be mapped to most keys
on the keyboard.

Furthermore, it allows you to choose between emulating keypresses for a set duration of time or have toggleable keys that switch between an on/off
state on reading specific input. These can also be deactivated using other inputs than those that activate them.

## Installation
So far, the code is functional (for **GOCube** and **Giiker**), but setting up your key mapping has to be done within the python code itself.
We might provide an easier way of doing this in the future. The code probably needs some serious refactoring as well,
but it shouldn't be too difficult to get it up and running if you just follow the steps below:

### 1. Requirements
You can install the required python modules using pip and the included required_python_modules.txt

In the command line, type: **pip install -r {path to required_python_modules.txt}**

### 2. Configure key mapping
In main.py, edit the Key objects in the dictionary that matches your cube model.

The Key objects have the following attributes:
1. **value**: string of the character they represent (see CHAR_MAP in directinput.py for reference)  
2. **toggle**: boolean for whether it's one-time or toggleable
3. **press_length**: if not toggleable, how long to emulate the keypush for
4. **cancel_keys**: if toggleable, key values that set the state to "off" (**Note**: toggleable keys are **NOT** automatically part of their own cancel_keys)

### 3. Connect the cube
When you run the python file it will open a webpage in chrome from which you will be able to connect to the cube.
Once the connection is established, assuming you have mapped your controls correctly and you don't get any python console errors,
you should be able to use your cube for whichever game as expected.

## Known Issues/Features to be Implemented
* Connecting multiple cubes of the same type simultaneously will map them to the same controller scheme, because individual units of a model are
not yet being distinguished between.
