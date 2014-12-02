comp-pool
=========

This node.js REST service allows distribution of computing jobs (in javascript) to a hive of web clients and will allow users to send their own jobs to the hive once the multiple security issues are adressed. Methods to try, server-side, the integrity and correcteness of job results are also provided.

It has nothing to do with pool cleaning appliances. Yet.

API Design
-------------
We use a volunteer pull distributed computation model over a REST API. That means clients can pull (`GET`) `jobs`, job input `variables` and `POST` `results` back to the API. We offer the following resources:

### Jobs ###
A `job` object includes:
* A javascript function named `execute_function(variable, context)`
* An optional `validate_result(variable, result, context)` function to be executed server-side. 
  * By default every result is accepted, otherwise they are validated by this function. 
  * Can also include post-processing code.
* An optional `variable_scheduler(context)` function that selects `variable objects` (see below) from the `job`'s collection to serve to clients, returning a `variable id`
  * By default a variable is served randomly 
* Associated `metadata`, all optional
  * `name`: `metadata.name`
  * `description`: `metadata.description[locale]` and `metadata.short_description[locale]`
  * `owner`: `metadata.owner`
  * Some sort of ranking, such as job supporters etc.

Jobs can be served directly using external REST ids or through a scheduler that organizes them for efficient processing in clients.

#### API Calls ####

    POST /jobs
To send a new job object, expected to be compiled by [Google Caja](https://developers.google.com/caja/) to enhance client's security as suggested [here](http://stackoverflow.com/questions/23758472/closing-access-to-global-variables-javascript). One of the objectives is job posting to be as automated as possible while being secure.

    GET /jobs/:id
Gets a job by id

    GET /jobs/schedulers/:scheduler_id`
Uses a scheduler to retrieve a job, internal algorithms are abstracted through this interface

### Job Variables ###
An input `variable` object is an arbitrary javascript object associated to a `job` and is passed to the `execute_function` on each run.

#### API Calls ####

    POST /jobs/:id/variable
Posts a new variable to be served to clients. Gets validated by the job's `validate_result` function if this function exists, otherwise is accepted by default.

    GET /jobs/:id/variable
Gets a variable through a variable scheduler, to be chained with the next call

    GET /jobs/:id/variable/:id
Gets a variable by id

### Job Results ###
A `result` object is an arbitrary javascript object associated to a `variable` the result of the computation over this `variable` object.


    `POST /jobs/:id/variable/:id/result`
Adds a new result associated to a job and job's variable

Example Job Schedulers
----------------------

* Random jobs
* Send jobs filtered by user status, for example, a user can choose to support orgs with his computer, so he chooses to only execute jobs from this chosen orgs.
* Send short jobs first, according to computed job metadata

#### History ####

It was firstly planned to be a Sinatra-based service, but the node.js ability to allow users to execute code server side made us to finally choose it.
