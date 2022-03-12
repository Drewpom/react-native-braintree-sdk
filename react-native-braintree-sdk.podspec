require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-braintree-sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "12.0" }
  s.source       = { :git => "https://github.com/getnoble/react-native-braintree-sdk.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"

  s.dependency "React-Core"

  s.dependency 'Braintree', '~> 5.7'
  s.dependency 'Braintree/DataCollector', '~> 5.7'
  s.dependency 'Braintree/Venmo', '~> 5.7'
  s.dependency 'Braintree/ApplePay', '~> 5.7'
end
