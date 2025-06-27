# NoteVault Setup Script Fixes

## Issues Fixed

The original `setup.sh` script had several permission-related issues that could cause installation failures. The following improvements have been made:

1. **Directory Permission Handling**: Added proper checks to ensure the project directory exists with correct permissions before attempting to clone the repository.

2. **Repository Cloning Fallback**: Added a fallback mechanism for repository cloning that will try an alternative approach if the initial `sudo -u` method fails.

3. **Log Directory Creation**: Improved log handling to ensure the log directory exists with proper permissions before attempting to write to log files.

4. **User Directory Permissions**: Enhanced the `create_user` function to explicitly set permissions on the project directory after user creation.

## How to Use

Run the setup script as root (with sudo):

```bash
sudo ./setup.sh
```

The script will now handle permission issues more gracefully and provide better error recovery.

## Common Issues

If you still encounter permission issues, you may need to manually create the project directory and set permissions:

```bash
sudo mkdir -p /opt/notizprojekt
sudo chown -R notizprojekt:notizprojekt /opt/notizprojekt
sudo chmod 755 /opt/notizprojekt
```

Then run the setup script again.