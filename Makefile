MOCHA = @NODE_ENV=test ./node_modules/.bin/mocha
.PHONY: test

test:
	$(MOCHA) test

test-coverage:
	$(MOCHA) -r blanket -R html-cov test > coverage/index.html
