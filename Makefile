TESTS = ./test/*.js
REPORTER = dot

test:
	@NODE_ENV=test mocha \
		--require expect \
		--reporter $(REPORTER)\
		--timeout 100 \
		--growl \
		$(TESTS)

.PHONY: test 
