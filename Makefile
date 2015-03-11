links: node_modules \
	node_modules/docvy-utils


node_modules:
	mkdir -p node_modules


node_modules/docvy-utils:
	ln -sf "$$(dirname $$PWD)/docvy-utils" $$PWD/$@


clean:
	rm -rf test/_test*


.PHONY: clean
