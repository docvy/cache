links: node_modules \
	node_modules/docvy-utils


node_modules:
	mkdir -p node_modules


node_modules/docvy-utils:
	ln -sf "$$(dirname $$PWD)/utils" $$PWD/$@


clean:
	rm -rf test/_test*


.PHONY: clean
