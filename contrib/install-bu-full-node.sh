#!/bin/sh

###############################################################################
#
#                             install-full-node.sh
#
# This is the cashnodes.io install script for Bitcoin Cash full node based on Bitcoin Unlimited.
#
# This script attempts to make your node automatically reachable by other nodes
# in the network. This is done by using uPnP to open port 8333 on your router
# to accept incoming connections to port 8333 and route the connections to your
# node running inside your local network.
#
# For security reason, wallet functionality is not enabled by default.
#
# Supported OS: Linux, Mac OS X, BSD, Windows (Windows Subsystem for Linux)
# Supported platforms: x86, x86_64, ARM
#
# Usage:
#   Open your terminal and type:
#
#     curl https://cashnodes.io/install-full-node.sh | sh
#
# Bitcoin Unlimited will be installed using binaries provided by bitcoinunlimited.info.
#
# If the binaries for your system are not available, the installer will attempt
# to build and install Bitcoin Unlimited from source.
#
# All files will be installed into $HOME/bitcoin-unlimited directory. Layout of this
# directory after the installation is shown below:
#
# Source files:
#   $HOME/bitcoin-unlimited/bitcoin/
#
# Binaries:
#   $HOME/bitcoin-unlimited/bin/
#
# Configuration file:
#   $HOME/bitcoin-unlimited/.bitcoin/bitcoin.conf
#
# Blockchain data files:
#   $HOME/bitcoin-unlimited/.bitcoin/blocks
#   $HOME/bitcoin-unlimited/.bitcoin/chainstate
#
#                     Need help? Contact ayeowch@gmail.com
#
###############################################################################

REPO_URL="https://github.com/BitcoinUnlimited/BitcoinUnlimited.git"

# See https://github.com/BitcoinUnlimited/BitcoinUnlimited/tags for latest version.
VERSION=1.2.0.1

TARGET_DIR=$HOME/bitcoin-unlimited
PORT=8333

BUILD=0
UNINSTALL=0

BLUE='\033[94m'
GREEN='\033[32;1m'
YELLOW='\033[33;1m'
RED='\033[91;1m'
RESET='\033[0m'

ARCH=$(uname -m)
SYSTEM=$(uname -s)
MAKE="make"
if [ "$SYSTEM" = "FreeBSD" ]; then
    MAKE="gmake"
fi
SUDO=""

usage() {
    cat <<EOF

This is the cashnodes.io install script for Bitcoin Cash full node based on Bitcoin Unlimited.

Usage: $0 [-h] [-v <version>] [-t <target_directory>] [-p <port>] [-b] [-u]

-h
    Print usage.

-v <version>
    Version of Bitcoin Unlimited to install.
    Default: $VERSION

-t <target_directory>
    Target directory for source files and binaries.
    Default: $HOME/bitcoin-unlimited

-p <port>
    Bitcoin Unlimited listening port.
    Default: $PORT

-b
    Build and install Bitcoin Unlimited from source.
    Default: $BUILD

-u
    Uninstall Bitcoin Unlimited.

EOF
}

print_info() {
    printf "$BLUE$1$RESET\n"
}

print_success() {
    printf "$GREEN$1$RESET\n"
    sleep 1
}

print_warning() {
    printf "$YELLOW$1$RESET\n"
}

print_error() {
    printf "$RED$1$RESET\n"
    sleep 1
}

print_start() {
    print_info "Start date: $(date)"
}

print_end() {
    print_info "\nEnd date: $(date)"
}

print_readme() {
    cat <<EOF

# README

To stop Bitcoin Unlimited:

    cd $TARGET_DIR/bin && ./stop.sh

To start Bitcoin Unlimited again:

    cd $TARGET_DIR/bin && ./start.sh

To use bitcoin-cli program:

    cd $TARGET_DIR/bin && ./bitcoin-cli -conf=$TARGET_DIR/.bitcoin/bitcoin.conf getinfo

To view Bitcoin Unlimited log file:

    tail -f $TARGET_DIR/.bitcoin/debug.log

To uninstall Bitcoin Unlimited:

    ./install-full-node.sh -u

EOF
}

program_exists() {
    type "$1" > /dev/null 2>&1
    return $?
}

create_target_dir() {
    if [ ! -d "$TARGET_DIR" ]; then
        print_info "\nCreating target directory: $TARGET_DIR"
        mkdir -p $TARGET_DIR
    fi
}

init_system_install() {
    if [ $(id -u) -ne 0 ]; then
        if program_exists "sudo"; then
            SUDO="sudo"
            print_info "\nInstalling required system packages.."
        else
            print_error "\nsudo program is required to install system packages. Please install sudo as root and rerun this script as normal user."
            exit 1
        fi
    fi
}

install_miniupnpc() {
    print_info "Installing miniupnpc from source.."
    rm -rf miniupnpc-2.0.20180222 miniupnpc-2.0.20180222.tar.gz && \
        wget -q http://miniupnp.free.fr/files/download.php?file=miniupnpc-2.0.20180222.tar.gz -O miniupnpc-2.0.tar.gz && \
        tar xzf miniupnpc-2.0.tar.gz && \
        cd miniupnpc-2.0.20180222 && \
        $SUDO $MAKE install > build.out 2>&1 && \
        cd .. && \
        rm -rf miniupnpc-2.0.20180222 miniupnpc-2.0.tar.gz
}

install_debian_build_dependencies() {
    $SUDO apt-get update
    $SUDO apt-get install -y \
        automake \
        autotools-dev \
        build-essential \
        curl \
        git \
        libboost-all-dev \
        libevent-dev \
        libminiupnpc-dev \
        libssl-dev \
        libtool \
        pkg-config
}

install_fedora_build_dependencies() {
    $SUDO dnf install -y \
        automake \
        boost-devel \
        curl \
        gcc-c++ \
        git \
        libevent-devel \
        libtool \
        miniupnpc-devel \
        openssl-devel
}

install_centos_build_dependencies() {
    $SUDO yum install -y \
        automake \
        boost-devel \
        curl \
        gcc-c++ \
        git \
        libevent-devel \
        libtool \
        openssl-devel
    install_miniupnpc
    echo '/usr/lib' | $SUDO tee /etc/ld.so.conf.d/miniupnpc-x86.conf > /dev/null && $SUDO ldconfig
}

install_archlinux_build_dependencies() {
    $SUDO pacman -S --noconfirm \
        automake \
        boost \
        curl \
        git \
        libevent \
        libtool \
        miniupnpc \
        openssl
}

install_alpine_build_dependencies() {
    $SUDO apk update
    $SUDO apk add \
        autoconf \
        automake \
        boost-dev \
        build-base \
        curl \
        git \
        libevent-dev \
        libtool \
        openssl-dev
    install_miniupnpc
}

install_mac_build_dependencies() {
    if ! program_exists "gcc"; then
        print_info "When the popup appears, click 'Install' to install the XCode Command Line Tools."
        xcode-select --install
    fi

    if ! program_exists "brew"; then
        /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
    fi

    brew install \
        --c++11 \
        automake \
        boost \
        libevent \
        libtool \
        miniupnpc \
        openssl \
        pkg-config
}

install_freebsd_build_dependencies() {
    $SUDO pkg install -y \
        autoconf \
        automake \
        boost-libs \
        curl \
        git \
        gmake \
        libevent2 \
        libtool \
        openssl \
        pkgconf \
        wget
    install_miniupnpc
}

install_build_dependencies() {
    init_system_install
    case "$SYSTEM" in
        Linux)
            if program_exists "apt-get"; then
                install_debian_build_dependencies
            elif program_exists "dnf"; then
                install_fedora_build_dependencies
            elif program_exists "yum"; then
                install_centos_build_dependencies
            elif program_exists "pacman"; then
                install_archlinux_build_dependencies
            elif program_exists "apk"; then
                install_alpine_build_dependencies
            else
                print_error "\nSorry, your system is not supported by this installer."
                exit 1
            fi
            ;;
        Darwin)
            install_mac_build_dependencies
            ;;
        FreeBSD)
            install_freebsd_build_dependencies
            ;;
        *)
            print_error "\nSorry, your system is not supported by this installer."
            exit 1
            ;;
    esac
}

build_bucash() {
    cd $TARGET_DIR

    if [ ! -d "$TARGET_DIR/bitcoin" ]; then
        print_info "\nDownloading Bitcoin Unlimited source files.."
        git clone --quiet $REPO_URL
    fi

    # Tune gcc to use less memory on single board computers.
    cxxflags=""
    if [ "$SYSTEM" = "Linux" ]; then
        ram_kb=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        if [ $ram_kb -lt 1500000 ]; then
            cxxflags="--param ggc-min-expand=1 --param ggc-min-heapsize=32768"
        fi
    fi

    print_info "\nBuilding Bitcoin Unlimited v$VERSION"
    print_info "Build output: $TARGET_DIR/bitcoin/build.out"
    print_info "This can take up to an hour or more.."
    rm -f build.out
    cd BitcoinUnlimited &&
        git fetch > build.out 2>&1 &&
        git checkout "bucash$VERSION" 1>> build.out 2>&1 &&
        git clean -f -d -x 1>> build.out 2>&1 &&
        ./autogen.sh 1>> build.out 2>&1 &&
        ./configure \
            CXXFLAGS="$cxxflags" \
            --without-gui \
            --with-miniupnpc \
            --disable-wallet \
            --disable-tests \
            --enable-upnp-default \
            1>> build.out 2>&1 &&
        $MAKE 1>> build.out 2>&1

    if [ ! -f "$TARGET_DIR/bitcoin/src/bitcoind" ]; then
        print_error "Build failed. See $TARGET_DIR/bitcoin/build.out"
        exit 1
    fi

    sleep 1

    $TARGET_DIR/bitcoin/src/bitcoind -? > /dev/null
    retcode=$?
    if [ $retcode -ne 1 ]; then
        print_error "Failed to execute $TARGET_DIR/bitcoin/src/bitcoind. See $TARGET_DIR/bitcoin/build.out"
        exit 1
    fi
}

get_bin_url() {
    url="https://bitcoinunlimited.info/downloads"
    case "$SYSTEM" in
        Linux)
            if program_exists "apk"; then
                echo ""
            elif [ "$ARCH" = "armv7l" ]; then
                url="$url/BUcash-$VERSION-arm32.tar.gz"
                echo "$url"
            elif [ "$ARCH" = "aarch64" ]; then
                url="$url/BUcash-$VERSION-arm64.tar.gz"
                echo "$url"
            elif [ "$ARCH" = "x86_64" ]; then
                url="$url/BUcash-$VERSION-linux64.tar.gz"
                echo "$url"
            elif [ "$ARCH" = "i686-pc" ]; then
                url="$url/BUcash-$VERSION-linux32.tar.gz"
                echo "$url"
            else
                url="$url/BUcash-$VERSION-$ARCH-linux-gnu.tar.gz"
                echo "$url"
            fi
            ;;
        Darwin)
            url="$url/BUcash-$VERSION-osx64.tar.gz"
            echo "$url"
            ;;
        FreeBSD)
            echo ""
            ;;
        *)
            echo ""
            ;;
    esac
}

download_bin() {
    checksum_url="https://raw.githubusercontent.com/BitcoinUnlimited/BitcoinUnlimitedWebDownloads/master/sign_$VERSION.json"

    cd $TARGET_DIR

    # $1 should be something like https://github.com/BitcoinUnlimited/BitcoinUnlimited/archive/bucash1.2.0.1.tar.gz
    rm -f BUcash-$VERSION.tar.gz checksum.asc signing_key.asc

    print_info "\nDownloading Bitcoin Unlimited binaries.."
    if program_exists "wget"; then
        echo $1
        echo $checksum_url
        wget "$1" -O BUcash-$VERSION.tar.gz &&
            wget "$checksum_url" -O checksum.asc &&
            tar xzf BUcash-$VERSION.tar.gz
    elif program_exists "curl"; then
        curl -s "$1" -o BUcash-$VERSION.tar.gz &&
            curl -s "$checksum_url" -o checksum.asc &&
            tar xzf BUcash-$VERSION.tar.gz
    else
        print_error "\nwget or curl program is required to continue. Please install wget or curl as root and rerun this script as normal user."
        exit 1
    fi

    if program_exists "shasum"; then
        checksum=$(shasum -a 256 BUcash-$VERSION.tar.gz | awk '{ print $1 }')
        if grep -q "$checksum" checksum.asc; then
            print_success "Checksum passed: BUcash-$VERSION.tar.gz ($checksum)"
        else
            print_error "Checksum failed: BUcash-$VERSION.tar.gz ($checksum). Please rerun this script to download and validate the binaries again."
            exit 1
        fi
    fi

    rm -f BUcash-$VERSION.tar.gz checksum.asc
    rename BUcash-?.?.? bucash
}

install_bucash() {
    cd $TARGET_DIR

    print_info "\nInstalling Bitcoin Unlimited v$VERSION"

    if [ ! -d "$TARGET_DIR/bin" ]; then
        mkdir -p $TARGET_DIR/bin
    fi

    if [ ! -d "$TARGET_DIR/.bitcoin" ]; then
        mkdir -p $TARGET_DIR/.bitcoin
    fi

    if [ "$SYSTEM" = "Darwin" ]; then
        if [ ! -e "$HOME/Library/Application Support/Bitcoin" ]; then
            ln -s $TARGET_DIR/.bitcoin "$HOME/Library/Application Support/Bitcoin"
        fi
    else
        if [ ! -e "$HOME/.bitcoin" ]; then
            ln -s $TARGET_DIR/.bitcoin $HOME/.bitcoin
        fi
    fi

    echo $TARGET_DIR
    # convert to a three digits format. It will not needed anymore once we get the
    # folder name reporting the correct 4 digits version format
    VER2=${VERSION%.*}
    if [ -f "$TARGET_DIR/BitcoinUnlimited/src/bitcoind" ]; then
        # Install compiled binaries.
        cp "$TARGET_DIR/BitcoinUnlimited/src/bitcoind" "$TARGET_DIR/bin/" &&
            cp "$TARGET_DIR/BitcoinUnlimited/src/bitcoin-cli" "$TARGET_DIR/bin/" &&
            print_success "Bitcoin Unlimited v$VERSION (compiled) installed successfully!"
    elif [ -f "$TARGET_DIR/BUcash-$VER2/bin/bitcoind" ]; then
        # Install downloaded binaries.
        cp "$TARGET_DIR/BUcash-$VER2/bin/bitcoind" "$TARGET_DIR/bin/" &&
            cp "$TARGET_DIR/BUcash-$VER2/bin/bitcoin-cli" "$TARGET_DIR/bin/" &&
                rm -rf "$TARGET_DIR/BUcash-$VER2"
            print_success "Bitcoin Unlimited v$VERSION (binaries) installed successfully!"
    else
        print_error "Cannot find files to install."
        exit 1
    fi

    cat > $TARGET_DIR/.bitcoin/bitcoin.conf <<EOF
listen=1
bind=0.0.0.0
port=$PORT
maxconnections=64
upnp=1

#dbcache=64
par=2
checkblocks=7
checklevel=0

disablewallet=1

rpcbind=127.0.0.1
rpcport=8332
rpcallowip=127.0.0.1
EOF
    chmod go-rw $TARGET_DIR/.bitcoin/bitcoin.conf

    cat > $TARGET_DIR/bin/start.sh <<EOF
#!/bin/sh
if [ -f $TARGET_DIR/bin/bitcoind ]; then
    $TARGET_DIR/bin/bitcoind -conf=$TARGET_DIR/.bitcoin/bitcoin.conf -datadir=$TARGET_DIR/.bitcoin -daemon
fi
EOF
    chmod ugo+x $TARGET_DIR/bin/start.sh

    cat > $TARGET_DIR/bin/stop.sh <<EOF
#!/bin/sh
if [ -f $TARGET_DIR/.bitcoin/bitcoind.pid ]; then
    kill \$(cat $TARGET_DIR/.bitcoin/bitcoind.pid)
fi
EOF
    chmod ugo+x $TARGET_DIR/bin/stop.sh
}

start_bucash() {
    if [ ! -f $TARGET_DIR/.bitcoin/bitcoind.pid ]; then
        print_info "\nStarting Bitcoin Unlimited.."
        cd $TARGET_DIR/bin && ./start.sh

        timer=0
        until [ -f $TARGET_DIR/.bitcoin/bitcoind.pid ] || [ $timer -eq 5 ]; do
            timer=$((timer + 1))
            sleep $timer
        done

        if [ -f $TARGET_DIR/.bitcoin/bitcoind.pid ]; then
            print_success "Bitcoin Unlimited is running!"
        else
            print_error "Failed to start Bitcoin Unlimited."
            exit 1
        fi
    fi
}

stop_bucash() {
    if [ -f $TARGET_DIR/.bitcoin/bitcoind.pid ]; then
        print_info "\nStopping Bitcoin Unlimited.."
        cd $TARGET_DIR/bin && ./stop.sh

        timer=0
        until [ ! -f $TARGET_DIR/.bitcoin/bitcoind.pid ] || [ $timer -eq 120 ]; do
            timer=$((timer + 1))
            sleep $timer
        done

        if [ ! -f $TARGET_DIR/.bitcoin/bitcoind.pid ]; then
            print_success "Bitcoin Unlimited stopped."
        else
            print_error "Failed to stop Bitcoin Unlimited."
            exit 1
        fi
    fi
}

check_bucash() {
    if [ -f $TARGET_DIR/.bitcoin/bitcoind.pid ]; then
        if [ -f $TARGET_DIR/bin/bitcoin-cli ]; then
            print_info "\nChecking Bitcoin Unlimited.."
            sleep 5
            $TARGET_DIR/bin/bitcoin-cli -conf=$TARGET_DIR/.bitcoin/bitcoin.conf -datadir=$TARGET_DIR/.bitcoin getinfo
        fi

        # TODO: need to change have this API on cashnodes-api
        reachable=$(curl -I https://bitnodes.cashnodes.io/api/v1/nodes/me-$PORT/ 2> /dev/null | head -n 1 | cut -d ' ' -f2)
        if [ $reachable -eq 200 ]; then
            print_success "Bitcoin Unlimited is accepting incoming connections at port $PORT!"
        else
            print_warning "Bitcoin Unlimited is not accepting incoming connections at port $PORT. You may need to configure port forwarding (https://bitcoin.org/en/full-node#port-forwarding) on your router."
        fi
    fi
}

uninstall_bucash() {
    stop_bucash

    if [ -d "$TARGET_DIR" ]; then
        print_info "\nUninstalling Bitcoin Unlimited.."
        rm -rf $TARGET_DIR

        # Remove stale symlink.
        if [ "$SYSTEM" = "Darwin" ]; then
            if [ -L "$HOME/Library/Application Support/Bitcoin" ] && [ ! -d "$HOME/Library/Application Support/Bitcoin" ]; then
                rm "$HOME/Library/Application Support/Bitcoin"
            fi
        else
            if [ -L $HOME/.bitcoin ] && [ ! -d $HOME/.bitcoin ]; then
                rm $HOME/.bitcoin
            fi
        fi

        if [ ! -d "$TARGET_DIR" ]; then
            print_success "Bitcoin Unlimited uninstalled successfully!"
        else
            print_error "Uninstallation failed. Is Bitcoin Unlimited still running?"
            exit 1
        fi
    else
        print_error "Bitcoin Unlimited not installed."
    fi
}

while getopts ":v:t:p:bu" opt
do
    case "$opt" in
        v)
            VERSION=${OPTARG}
            ;;
        t)
            TARGET_DIR=${OPTARG}
            ;;
        p)
            PORT=${OPTARG}
            ;;
        b)
            BUILD=1
            ;;
        u)
            UNINSTALL=1
            ;;
        h)
            usage
            exit 0
            ;;
        ?)
            usage >& 2
            exit 1
            ;;
    esac
done

WELCOME_TEXT=$(cat <<EOF

Welcome!

You are about to install a Bitcoin Cash full node based on Bitcoin Unlimited v$VERSION.

All files will be installed under $TARGET_DIR directory.

Your node will be configured to accept incoming connections from other nodes in
the Bitcoin Cash network by using uPnP feature on your router.

For security reason, wallet functionality is not enabled by default.

After the installation, it may take several hours for your node to download a
full copy of the blockchain.

If you wish to uninstall Bitcoin Unlimited later, you can download this script and
run "sh install-full-node.sh -u".

EOF
)

print_start

if [ $UNINSTALL -eq 1 ]; then
    echo
    read -p "WARNING: This will stop Bitcoin Unlimited and uninstall it from your system. Uninstall? (y/n) " answer
    if [ "$answer" = "y" ]; then
        uninstall_bucash
    fi
else
    echo "$WELCOME_TEXT"
    if [ -t 0 ]; then
        # Prompt for confirmation when invoked in tty.
        echo
        read -p "Install? (y/n) " answer
    else
        # Continue installation when invoked via pipe, e.g. curl .. | sh
        answer="y"
        echo
        echo "Starting installation in 10 seconds.."
        sleep 10
    fi
    if [ "$answer" = "y" ]; then
        if [ "$BUILD" -eq 0 ]; then
            bin_url=$(get_bin_url)
        else
            bin_url=""
        fi
        stop_bucash
        create_target_dir
        if [ "$bin_url" != "" ]; then
            download_bin "$bin_url"
        else
            install_build_dependencies && build_bucash
        fi
        install_bucash && start_bucash && check_bucash
        print_readme > $TARGET_DIR/README.md
        cat $TARGET_DIR/README.md
        print_success "If this your first install, Bitcoin Unlimited may take several hours to download a full copy of the blockchain."
        print_success "\nInstallation completed!"
    fi
fi

print_end
