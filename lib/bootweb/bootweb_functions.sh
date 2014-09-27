#!/bin/bash
# Title          : Install_Functions.sh
# Description    : BootWeb Application Server Installer
# Authors        : BootWeb by the KaraCos Team  < http://www.karacos.org >
#                : Cyril Gratecos               < cyril.gratecos@gmail.com >
#                : Nicolas Karageuzian          < nicolas@karageuzian.com >
# License        : The MIT License (MIT)
# Copyright (c)  : <2014-2113> <The KaraCos Team>
# Date           : 20140808
# Version        : 0.1

NODE_URL="http://nodejs.org/dist"


_needed_commands="ls curl grep cut sed uname" ;

function log {
        # @info         :       log function
        # @args         :       level msg
        local INFO=0
        local WARN=1
        local DEBUG=2
        local LEVEL=${1}
        local MSG=${2}
        local NLEVEL=${!LEVEL}
        local NLOGLEVEL=${!LOGLEVEL}
        local TIME=$( date +"%T:%N" )
        TIME=${TIME:0:12}
        local DATE=`date +" %d/%m/%Y - ${TIME} - %:z"`
        if [ ${NLOGLEVEL} -ge ${NLEVEL} ]
        then
                local LOGMSG="${DATE} ${LEVEL} ${MSG}"
                echo -e "${LOGMSG}" >> ${LOGFILE}
        fi
}

function spinner {
  local pid=$!
  local delay=0.75
  local spinstr='|/-\\'
  echo -e "\tBuild in Progress Please Wait ..."
  while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
      local temp=${spinstr#?}
      printf " [%c]  " "$spinstr"
      local spinstr=$temp${spinstr%"$temp"}
      sleep $delay
      printf "\b\b\b\b\b\b"
  done
  printf "    \b\b\b\b"
}

function splashScreen {
echo <<EOF
Welcome To
 _____                  __    __      __          __
/\  _ \                /\ \__/\ \  __/\ \        /\ \
\ \ \_\\    ____    ___\ \  _\ \ \/\ \ \ \    ___\ \ \____
 \ \  _<   / __ \  / __ \ \ \/\ \ \ \ \ \ \  / __ \ \  __ \
  \ \ \_\\/\ \_\ \/\ \_\ \ \ \_\ \ \_/ \_\ \/\  __/\ \ \_\ \
   \ \___/\ \____/\ \____/\ \__\\ \________/\ \____\\ \____/
    \/__/  \/___/  \/___/  \/__/ '\/__//__/  \/____/ \/___/
                                       By the KaraCos Team
EOF
}


function checkrequirements {
        command -v command >/dev/null 2>&1 || {
                echo "WARNING> \"command\" not found. Check requirements skipped !"
                return 1 ;
        }
        for requirement in ${_needed_commands} ; do
                echo -n "checking for \"$requirement\" ... " ;
                command -v ${requirement} > /dev/null && {
                        echo "ok" ;
                        continue ;
                } || {
                        echo "required but not found !" ;
                        _return=1 ;
                }
                done
        [ -z "${_return}" ] || { 
                echo "ERR > Requirement missing." >&2 ; 
                exit 1 ;
        }
	export CHECKS_DONE=true
}


# This Function get the processor model from uname command
# it set $PROC to :
#		  x86 for 32bit architectures, 
#                 x64 for 64bit architectures.
function getProc {
  PROC=$( uname -p )
  x86="i386 i586 i686"
  x64="x86_64"
  if [[ $x86 == *$PROC* ]]
  then
    export PROC="x86"
  elif [[ $x64 == *$PROC* ]]
  then
    export PROC="x64"
  fi
}

# This function get the os version from uname command
# it set $OS to : 
#		  linux  for linux systems, 
#                 darwin for MacOS systems, 
#                 sunos for Solaris systems.
function getOs {
  OS=$( uname -o )
  if [[ "$OS" =~ "Linux" ]]
  then
    export OS="linux"
  elif [[ "$OS" =~ "Darwin" ]]
  then 
    export OS="darwin"
  fi  
}

function getConfOpt {
  local SERVER=$1
  local OPTION=$2
  echo $( grep $OPTION $BW_ROOT/server/$SERVER/etc/bootweb.conf | \
          cut -d":" -f2 | sed -e 's/^[ \t]*//' -e 's/[ \t]*$//' )
}

function doInstall {
  getOs
  getProc
  SERVERS=$( ls $BW_ROOT/server )
  cd $BW_ROOT/bin
  for SERVER in $SERVERS
  do
    export $SERVER
    VERSION=$( getConfOpt $SERVER node_version )
    if [ ! -d "node-$VERSION-$OS-$PROC" ]
    then
      if [ "$CHECKS_DONE" != true ]
      then
        checkrequirements
      fi
      URL=$NODE_URL/$VERSION/node-$VERSION-$OS-$PROC.tar.gz
      echo "The Server $SERVER require nodejs $VERSION"
      echo "Installing $URL"
      curl -0 --progress-bar $URL | tar -xz
    fi
    setRights
  done
}

function setRights {
  USER=$( getConfOpt $SERVER worker_user )
  GROUP=$( getConfOpt $SERVER worker_group )
  chown -R $USER:$GROUP $BW_ROOT/server
}

function addUser {
  USER=$( getConfOpt $SERVER worker_user )
  GROUP=$( getConfOpt $SERVER worker_group )
  if [ ! grep -q $USER /etc/passwd ]
  then
    useradd -g $GROUP -r -M -d $BW_ROOT -s /bin/false $USER
  fi
  if [ ! grep -q bootweb /etc/group ]
  then
    groupadd -r $GROUP
    usermod -g $GROUP $USER
  fi
}	
