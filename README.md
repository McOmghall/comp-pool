comp-pool
=========

It allows distribution of computing jobs (in javascript) to a hive of web clients and will allow users to send their own jobs to the hive once the multiple security issues are adressed.
We also offer a tagging-per-topic, last-updated-on-top, real time forum.

It has nothing to do with pool cleaning appliances. Yet.

It works on:

* Ruby 1.9 / Rails 4.1
* jQuery / ujs
* MongoDB

=== 2014/04/07 ===

Started building the project's skeleton in Sinatra. Adding "views" and "models" with a static public folder structure.

=== 2014/04/11 ===

Decided Sinatra doesn't offer this project something valuable (since a clean asset pipeline is critical to serve javascripts), and switched to Rails 4.1.
