# Clone tous les projets sur github, à utiliser seulement pour la première config
clone-projects:
	git clone --branch main https://github.com/wefund-qsi/wefund-frontend.git
	git clone --branch main https://github.com/wefund-qsi/wefund-projects-service.git
	git clone --branch main https://github.com/wefund-qsi/wefund-contributions-paiements-utilisateurs.git
	git clone --branch main https://github.com/wefund-qsi/wefund-dashboard.git

# Fais le fetch de chaque projet pour le mettre à jour avec l'état donnée par l'équipe
pull-projects:
	cd wefund-frontend; git checkout main; git pull origin
	cd wefund-projects-service; git checkout main; git pull origin
	cd wefund-contributions-paiements-utilisateurs; git checkout main; git pull origin
	cd wefund-dashboard; git checkout main; git pull origin

# Efface tous les projets clonés du DevEnv
delete-projects:
	rm -rf wefund-frontend
	rm -rf wefund-projects-service
	rm -rf wefund-contributions-paiements-utilisateurs
	rm -rf wefund-dashboard

# Lance tous les projets avec un pointer sur la main
dry-run-projects: delete-projects clone-projects
	docker compose up