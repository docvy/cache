links: node_modules/docvy-utils


node_modules/docvy-utils:
	mkdir -p node_modules
	ln -s "$$(dirname $$PWD)/docvy-utils" $$PWD/$@

clean:
	rm -rf test/_test*

.PHONY: clean
