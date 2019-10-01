var shell = require('shelljs');
let user = process.env.USER || "";
if (user == 'root') {
  shell.echo('This module cant be installed with root privileges');
  shell.exit(1);
}

if ((!shell.which('curl'))||(!shell.which('grep'))||(!shell.which('head'))||(!shell.which('unzip'))) {
  shell.echo('Your system should have curl,grep,unzip and head in order to this module work properly');
  shell.exit(1);
}

var tf_url = "https://releases.hashicorp.com/terraform/"
var tf_last_version = shell.exec("curl -s "+tf_url+" | grep terraform_ | head -n 1 | awk -F'>' '{print $2}' | awk -F'<' '{print $1}'", {silent:true}).stdout;
tf_last_version = tf_last_version.replace('\n','').replace('terraform_','')

switch(process.platform) {
  case "darwin":
    platform = "amd64"
    system_os = "darwin"
  break
  case "linux":
    platform = "amd64"
    system_os = "linux"
  break
  default:
    console.log('This module is not working with '+process.platform+' platform yet.');
    process.exit(2);
}
tf_url = tf_url+tf_last_version+"/terraform_"+tf_last_version+"_"+system_os+"_"+platform+".zip"
shell.echo('Terraform '+tf_last_version+' will be installed...');
shell.mkdir('-p', '~/terraform/');
shell.exec('curl -s -o ~/terraform/terraform.zip '+tf_url)
shell.exec('unzip -o -q ~/terraform/terraform.zip -d ~/terraform/')
shell.rm('~/terraform/terraform.zip')
shell.exec('echo "PATH=$PATH:~/terraform" >> ~/.env')
shell.exec('cat ~/.env >> ~/.bashrc')
shell.exec('export PATH=$PATH:~/terraform')
shell.echo('Finished!');
