#!/bin/sh

SRC_DIR=$1
CACERT_DIR=$2

if [ ! -d "$SRC_DIR" ] || [ ! -d "$CACERT_DIR" ]
then
        echo "usage: $0 src_dir cacert_path"
        exit -1
fi

for srcFile in `find $SRC_DIR -name '*.crt' -o -name '*.pem'`
do
	echo "processing file $srcFile"

        FILE_NUM=0
        FINGERPRINT=`openssl x509 -subject_hash -in "$srcFile" | head -n 1`

        if [ "$FINGERPRINT" == "" ]
        then
                echo " error: could not get fingerprint, skipping."
                continue
        fi

        echo "  fingerprint: $FINGERPRINT"

        for certFile in `find "$CACERT_DIR" -name "$FINGERPRINT.*"`
        do
                echo "  checking file $certFile"
                cmp -s "$srcFile" "$certFile"

                if [ $? -eq 0 ]
                then
                        FILE_NUM=-1
                        echo "  cert allready exsists: $certFile"
                        break
                else
                        let FILE_NUM++
                fi
        done

        if [ "$FILE_NUM" != "-1" ]
        then
                FILE_NAME="$CACERT_DIR/$FINGERPRINT.$FILE_NUM"
                cp "$srcFile" "$FILE_NAME"
                echo "  file copied to: $FILE_NAME"
        fi
done
