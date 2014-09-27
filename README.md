	Welcome To
	 _____                  __    __      __          __
	/\  _ \                /\ \__/\ \  __/\ \        /\ \
	\ \ \_\\    ____    ___\ \  _\ \ \/\ \ \ \    ___\ \ \____
	 \ \  _<   / __ \  / __ \ \ \/\ \ \ \ \ \ \  / __ \ \  __ \
	  \ \ \_\\/\ \_\ \/\ \_\ \ \ \_\ \ \_/ \_\ \/\  __/\ \ \_\ \
	   \ \___/\ \____/\ \____/\ \__\\ \________/\ \____\\ \____/
	    \/__/  \/___/  \/___/  \/__/ \/__/ /__/  \/____/ \/___/
                                               By the KaraCos Team
                                            http://www.karacos.org

## How to install

1. Git clone this repo somewhere in your drive
2. Download nodejs for you plateform and extract it in the ./bin directory.
3. Edit ./BootWeb and set NODEJS and NPM variables (according to your ./bin/nodejs folder name).
4. cd in the directory ./lib and run npm install.
5. lanch ./BootWeb start default

## How to use (In the futur !!)

BootWeb app

   - create 	: Create an application
   - delete  	: Remove an application
   - mount 	: Mount an application in a server routing namespace
   - umount 	: Umount an application from a server routing namespace
   - list 	: List availables applications
   - show	: List Mounted application
   - build	: Compile all JS and create a zip of the given app
   - commit	: Commit an app to a BootWeb repository
   - pull	: Pull an app from a BootWeb repository

BootWeb server

    - add	: Create a server
    - rm 	: Remove a server
    - start 	: Start a server
    - stop 	: Stop a server
    - status 	: Get the current status of a server
    - restart 	: Restart a server
    - console 	: Get a shell to administer a Live server
    - backup 	: Create a backup of a server
