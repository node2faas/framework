![images/node2faas-logo-big.png](images/node2faas-logo-big.png)

### Node Applications conversor to Function as a Service (FaaS) Deployments.

[Hot Page](https://node2faas.faasification.com/)

This project is the result of Leonardo Rebouças de Carvalho's master's degree, under the supervision of Aleteia Araujo, at the University of Brasília. Dissertation available at https://repositorio.unb.br/jspui/bitstream/10482/40473/1/2020_LeonardoRebou%c3%a7asdeCarvalho.pdf


## Versions
  - 0.2.0 - 2021,Oct
    1. AWS: 
      - Add CloudWatch automatic integration;
      - Update runtime from nodejs10.x (deprecated) to nodejs14.x.
    1. FaaS zip file generated with dependencies (node_modules);
    1. Replacing package Request (deprecated) by Axios
    1. Automatically add Axios in generated app package.json
    1. Parameters passed via POST
    1. New annotation feature: force / skip publication on FaaS
  - 0.1.1 - 2020,Nov
    1. Minor bug corrections;
    1. Graphics on evaluations;
    1. Readme Update
  - 0.1.0 - 2019,Dec
    1. Add multicloud orchestrator (Terraform) with support to AWS, GCP and Azure FaaS services;
    1. Function pre-analysis;
  - 0.0.1 - 2018,Dec
    1. Initial Release

## Purpose

This framework intend to help NodeJS developers to migrate from monolith model to function as a service (serverless) model. It parses the original code looking for exported functions and creates an equivalent function on the provider. Instead of the original function is placed a restAPI request to FaaS.

## Pre-Requisites

To use this conversor you need to have an active account in one of this FaaS services:
 - Amazon AWS Lambda;
 - Google Functions;
 - Microsoft Azure Functions.

### Get credentials parameters on AWS
 * Log in to your AWS Management Console.
 * Click on your user name at the top right of the page.
 * Click on the Security Credentials link from the drop-down menu.
 * Find the Access Credentials section, and copy the latest Access Key ID.
 * Click on the Show link in the same row, and copy the Secret Access Key.

 You should obtain this parameters:
 * access_key_id
 * secret_access_key

### Get credentials parameters on Azure

 You should obtain this parameters:
 * subscription_id
 * azure_tenant_id
 * azure_client_id
 * azure_client_secret

 Follow this instructions: [click](https://www.inkoop.io/blog/how-to-get-azure-api-credentials/)

### Get credentials parameters on GCP

 * Create a service account and set permissions to operate the Compute Engine and VPC Networks.

 You should obtain a JSON file with this parameters:
 * client_x509_cert_url
 * client_email
 * client_id
 * project_id
 * private_key_id
 * zone

The JSON file location will be prompted by the framework during its process.

## Workflow

![node2faas-workflow](images/workflow.png)

## Conversion Process

![node2faas-workflow](images/convertion-process.png)

## Framework Composition

![node2faas-composition](images/node2faas-composition.png)


## Installation

```npm install node2faas```

or

```git clone https://github.com/node2faas/framework.git```

```cd node2faas```

```npm link```

## Usage

- Run: ```node2faas --help``` on your terminal to get the CLI Instructions

![node2faas-help](images/node2faas-help.png)


- Run: ```node2faas --target [/path/to/original/application]```

- Follow de conversor instructions

- After proccess, check the directory *output* and your application converted to operate with FaaS should be there.

## Features

- Convert only .js files (other file types are skipped)
- Stores provider credentials after first execution (don't ask again)
- Creates new FaaS function on the choose provider
- Creates all provider API Gateway resources
- Annotations (add a comment anywhere inside function definition)
  - Skip publication: 
    - `//@node2faas-skip`
  - Force publication: 
    - `//@node2faas-force`
  

## Limitations

The framework is prepared to work only with:

- Providers:
	- AWS Lambda
	- GCP Functions
	- Azure Functions
- Function types:
	- exported
		- Ex: ```exports.functionName = function(params) { ... } ```

## Examples

This project contains some examples to guide you. Look inside examples folder.

#### Overload example

- available in path: examples/mocked/bounds

The load example explores 3 potential function loads:
 - Memory -> process with high memory consumption
 - CPU -> process with high CPU consumption
 - I/O -> process with high I/O consumption

## Evaluations

### Tests without orchestrator

- 1 to 100 concurrent requests to each service (traditional and converted)
- Simple Test (simple math operations)
- CPU stress Test (multiple cycles of simple operations)
- Memory stress Test (multiple cycles of writing on memory operations)
- I/O stress Test (multiple cycles of writing on disk operations)
- All data generated in this evaluation is available in path: evaluations/preliminary/outputs
- Files generated have this structure: [initial timestamp in nanoseconds],[final timestamp in nanoseconds],[duration in nanoseconds],[output from service]

### Test Architecture

![node2faas-test-arch](images/test_arch.png)

### Results of Simple Test
![simple-test](images/exp1_math_results.png)

### Results of CPU Stress Test
![cpu-test](images/exp1_cpu_results.png)

### Results of Memory Stress Test
![memory-test](images/exp1_mem_results.png)

### Results of Memory I/O Test
![io-test](images/exp1_io_results.png)


### Tests with Terraform as orchestrator

- CPU stress Test (multiple cycles of simple operations)
- Memory stress Test (multiple cycles of writing on memory operations)
- I/O stress Test (multiple cycles of writing on disk operations)

#### Parameters
![conclusive-test-params](images/conclusive-test-params.png)

- All data generated in this evaluation is available in path: evaluations/conclusive/results

- A list of test case was generated using the parameters. This table is available in file: evaluation/conclusive/test_cases.csv

- Files generated have this structure: [id test case],[sequence],[test output],[duration in nanoseconds]

### Results of CPU Bound Test
![cpu-conclusive-test](images/exp2_cpu.png)

### Results of Memory Bound Test
![mem-conclusive-test](images/exp2_mem.png)

### Results of I/O Bound Test
![io-conclusive-test](images/exp2_io.png)

### Reliability rates
![reliability](images/reliability.png)

### Minimal and maximal execution time
![min_max_exec_time](images/min_max_exec_time.png)


## Publications

 - 2019, May => CLOSER, Heraklion, Greece ([paper](https://www.scitepress.org/PublicationsDetail.aspx?ID=idUowDezrE8=&t=1))

 - 2020, May => CLOSER, Online Streaming ([paper](https://www.insticc.org/Primoris/Resources/PaperPdf.ashx?idPaper=93815))

 - 2020, Nov => CCGRID, Melbourne, Australia ([paper](https://ieeexplore.ieee.org/document/9139623))
 
 - 2023, Oct => IEEE Access ([paper](https://ieeexplore.ieee.org/document/10273986))

## Support

If you need more information, please send a message to: leouesb@gmail.com
