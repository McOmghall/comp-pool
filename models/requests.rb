class Request
  include MongoMapper::Document
  key :user_ip, String
  many :user_agents
end

class UserAgent
  include MongoMapper::EmbeddedDocument
  key :user_agent, String
  many :request_urls
end

class RequestUrl
  include MongoMapper::EmbeddedDocument
  key :request_url, String
  timestamps!
end