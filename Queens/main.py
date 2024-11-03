from bs4 import BeautifulSoup
import numpy as np
from math import sqrt
from solver import QueensSolver

def extract_table():
    with open("webpage.html") as fp:
        soup = BeautifulSoup(fp,'html.parser')

    # Trouver toutes les div avec des classes commençant par "queens-cell"
    queens_cells = soup.find_all(class_=lambda class_name: class_name and class_name.startswith("queens-cell"))

    # Extraire les noms de classes uniques
    classes = []
    for tag in queens_cells:
        for class_name in tag.get("class", []):
            if class_name.startswith("cell-color-"):
                classes.append(int(class_name[11:]))

    # Afficher la liste des classes
    classes = np.array(classes).reshape((-1,int(sqrt(len(classes)))))
    return(classes)

if __name__ == "__main__":
    table = extract_table()
    solver = QueensSolver(matrix=table)
    s = solver.solve()
    print(solver.crowns)
