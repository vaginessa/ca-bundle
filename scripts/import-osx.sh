#!/bin/sh

SRC_DIR=$1

if [ ! -d "$SRC_DIR" ]
then
        echo "usage: $0 ca_dir"
        exit -1
fi

APPLE_CA_LIST=`sudo security find-certificate -a -c 'Apple' -Z /System/Library/Keychains/SystemRootCertificates.keychain | grep -i 'SHA-1' | sed -e 's/SHA-1 hash: //g'`
ROOT_CA_LIST=`sudo security find-certificate -a -Z /System/Library/Keychains/SystemRootCertificates.keychain | grep -i 'SHA-1' | sed -e 's/SHA-1 hash: //g'`
ROOT_CA_LIST_LABEL=`sudo security dump-keychain /System/Library/Keychains/SystemRootCertificates.keychain | grep -Eo '"labl"<blob>=(0x[0-9A-Z]* +){0,1}"([^"]*)' | sed -E 's/"labl"<blob>=(0x[0-9A-Z]+ +){0,1}"//g'`

confirm () {
    # call with a prompt string or use a default
    read -r -p "${1:-Are you sure? [y/N]} " response
    case $response in
        [yY][eE][sS]|[yY])
            true
            ;;
        *)
            false
            ;;
    esac
}

delete_ca () {
    echo "cp /System/Library/Keychains/SystemRootCertificates.keychain /System/Library/Keychains/SystemRootCertificates.keychain.bak"
    sudo cp /System/Library/Keychains/SystemRootCertificates.keychain /System/Library/Keychains/SystemRootCertificates.keychain.bak


    while read -r cert
    do
    	if [[ $APPLE_CA_LIST == *"$cert"* ]]
    	then
    	    echo "skipping apple cert: $cert";
    	    continue;
    	fi

    	echo "sudo security delete-certificate -Z $cert /System/Library/Keychains/SystemRootCertificates.keychain"
    	sudo security delete-certificate -Z $cert /System/Library/Keychains/SystemRootCertificates.keychain || echo "\n\t \033[0;31mWARNING: skipping \"$cert\"\033[0m"
    done <<< "$ROOT_CA_LIST"
}

import_ca () {
    for srcFile in `find $SRC_DIR -name '*.crt' -o -name '*.pem'`
    do
        echo "sudo security add-trusted-cert -d -r trustRoot -k /System/Library/Keychains/SystemRootCertificates.keychain \"$srcFile\""
        sudo security add-trusted-cert -d -r trustRoot -k /System/Library/Keychains/SystemRootCertificates.keychain "$srcFile" || echo "\n\t \033[0;31mWARNING: skipping \"$srcFile\"\033[0m"
    done
}

confirm "Show currently installed CA bundle? [y/N] " && echo "$ROOT_CA_LIST_LABEL"

echo "\n\nDelete all root CA's. (Apple CAs are excluded)"
confirm && delete_ca

echo "\n\nImport certificates from $SRC_DIR"
confirm && import_ca

echo "\ndone.\n"
