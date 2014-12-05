comp-pool
=========

This node.js REST service allows distribution of computing jobs (in javascript) to a hive of web clients and will allow users to send their own jobs to the hive once the multiple security issues are adressed. Methods to try, server-side, the integrity and correcteness of job results are also provided.

It has nothing to do with pool cleaning appliances. Yet.

API Design
-------------
We use a volunteer pull distributed computation model over a REST API. That means clients can pull (`GET`) `jobs`, job input `variables` and `POST` `results` back to the API. Every resource includes a `self ref` and other semantic `refs` for `HATEOAS` compliance. We offer the following resources:

## Resources ##

### Jobs ###
A `job` object includes:
* `function execute_function(variable, context)`, is expected to return the `context`  object with any possible modifications and a `result` field. Some jobs could require client-side state, therefore this object is provided.
* `function validate_result(variable, result, context)` (optional) to be executed server-side. 
  * By default every result is accepted, otherwise they are validated by this function. 
  * Can also include post-processing code.
  * It's not usually served to the client, as it's not required. If we finally implement job execution federation this is going to be external.
* `function variable_scheduler(context)` (optional) server-side function that selects `variable objects` (see below) from the `job`'s collection to serve to clients, returning a `variable id`
  * By default a variable is served randomly 
  * It's not usually served to the client, as it's not required. If we finally implement job execution federation this is going to be external.
* `metadata` (optional)
  * `name` (optional) : `metadata.name`
  * `description` (optional) : `metadata.description[locale]` and `metadata.short_description[locale]`
  * `owner` (optional) : `metadata.owner`
  * Other fields can be described, and are optional and arbitrary.

Jobs can be served directly using external REST ids or through a scheduler that organizes them for efficient processing in clients.

##### Job resources API #####

    POST /jobs
To send a new job object, expected to be compiled by [Google Caja](https://developers.google.com/caja/) to enhance client's security as suggested [here](http://stackoverflow.com/questions/23758472/closing-access-to-global-variables-javascript). One of the objectives is job posting to be as automated as possible while being secure.

    GET /jobs{/:id}
Gets a job by id. If there's no `:id` specified it uses a job determined by the default scheduler (defined by config).

    GET /jobs/scheduled{/:scheduler_id}`
Sometimes you might want to define different schedulers, this selects a job using a defined scheduler. If no `:scheduler_id` is specified it uses the default one.

### Job Variables ###
An input `variable` object is an arbitrary javascript object associated to a `job` and is passed to the `execute_function` on each run.

##### Variable resources API #####

    POST /jobs/:id/variables
Posts a new variable to be served to clients. Gets validated by the job's `validate_result` function if this function exists, otherwise is accepted by default.

    GET /jobs/:id/variables
Gets a variable through a variable scheduler, to be chained with the next call

    GET /jobs/:id/variables/:id
Gets a variable by id

### Job Results ###
A `result` object is an arbitrary javascript object associated to a `variable` the result of the computation over this `variable` object.

##### Result resources API #####

    POST /jobs/:id/variables/:id/result
Adds a new result associated to a job and job's variable

### Job Flow ###
A `flow` is a javascript object that describes dependencies of computation over `jobs`, effectively describing a parallel schema to a job execution set as a `Tree`. 

The structure of this class of objects:
* `jobs` array of
  * `job` : url
  * `variable` : url (optional)
  * `if` : `function(variable, context)` (optional) returns true if this job is ok for execution on this context
  * `while` : `function(variable, context)` (optional) repeats the execution of the job if it returns true
* `dependent` inner flow object

The business logic for this kind of objects is that every `job` gets executed with the specified `variable` and for every `job array` the results of these jobs are merged in an object that gets passed to the parent object. It proceeds recursively to the root of the object.


## Example interaction ##

We describe an interaction to `GET` a job, a variable for that job and `POST` the result back.

[CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing) compliance 
OPTIONS /

    200 OK
    Access-Control-Allow-Origin: *
GET /

    200 OK
    {
      "job_scheduler_url": "/jobs/scheduler"
    }
GET /jobs/scheduler

    200 OK
    {
      "_links" : {
        "self" : "/jobs/3141592",
        "get_variables" : "/jobs/3141592/variables
      },
      "metadata" : {
        "name" : "Example job",
        "owner" : "McOmghall",
        "description" : {
          "en" : "this is a job"
          "es" : "esto es un job"
        }
      }
      "execute_function" : "function (variable, context) {...}"
    }
 
 GET /jobs/3141592/variables

    200 OK
    {
      "_links" : {
        "self" : "/jobs/3141592/variables/test_limit_case",
        "post_result" : "/jobs/3141592/variables/test_limit_case/results",
        "get_job" : "/jobs/3141592
      },
      "data_field_one" : {
        "foo" : 1,
        "bar" : {
          "baz" : "zt"
        }
      }
      "data_field_two" : {
        "foobar" : "baz"
      }
    }

At this point `execute_function` from the `job resource` is executed with this object as the `variable` argument.
Note that the `_links` part of the resource object should not be passed to the function.

Finally, POST /jobs/3141592/variables/test_limit_case/results context.result

    201 Created
    Location: "/jobs/3141592/variables/test_limit_case/results/20141202090909"

Example Job Schedulers
----------------------

* Random jobs
* Send jobs filtered by user status, for example, a user can choose to support orgs with his computer, so he chooses to only execute jobs from this chosen orgs.
* Send short jobs first, according to computed job metadata

#### Plans ####

* Use it to explore multithreading in javascript and multithreaded designs
* WebCL support

#### History ####

It was firstly planned to be a Sinatra-based service, but the node.js ability to allow users to execute code server side made us to finally choose it.
