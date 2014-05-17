MOCHA = @NODE_PATH=lib NODE_ENV=test node_modules/.bin/mocha --reporter spec
.PHONY: test

test:
	$(MOCHA) test

test-cov:
	$(MOCHA) -r blanket -R html-cov test > coverage/index.html
