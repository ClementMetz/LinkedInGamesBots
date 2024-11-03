import numpy as np
import copy

class QueensSolver():
    def __init__(self,matrix) -> None:
        self.m = matrix
        self.side = len(matrix[0])
        self.nb_colors = self.side
        self.crossed = np.full((self.side, self.side),False)
        self.crowns = np.full((self.side, self.side),False)
        self.found_crowns = 0
        self.build_color_lists()
    
    def build_color_lists(self): #returns list of coordinates for each color in order
        self.color_lists = []
        for i in range(self.side):
            self.color_lists.append([])
        for i in range(self.side):
            for j in range(self.side):
                self.color_lists[self.m[i,j]].append([i,j])
    

    def remove_from_color_lists(self,i,j,color):
        try:
            self.color_lists[color].remove([i,j])
        except:
            pass
    
    def get_less_populated_color(self):
        mincolor = -1
        minvalue = self.side**2
        for color in range(self.nb_colors):
            l=len(self.color_lists[color])
            if l>0:
                if l<minvalue:
                    mincolor=color
                    minvalue=l
        return(mincolor)


    def cross_out(self,i,j): #mark squares directly diagonal, on same column, same rank and same color as checked
        if i>=1:
            if j>=1:
                self.crossed[i-1,j-1] = True
                color = self.m[i-1,j-1]
                self.remove_from_color_lists(i-1,j-1,color)
            if j<self.side-1:
                self.crossed[i-1,j+1] = True
                color = self.m[i-1,j+1]
                self.remove_from_color_lists(i-1,j+1,color)
        if i<self.side-1:
            if j>=1:
                self.crossed[i+1,j-1] = True
                color = self.m[i+1,j-1]
                self.remove_from_color_lists(i+1,j-1,color)
            if j<self.side-1:
                self.crossed[i+1,j+1] = True
                color = self.m[i+1,j+1]
                self.remove_from_color_lists(i+1,j+1,color)
        
        self.crossed[i,:] = True
        self.crossed[:,j] = True
        for k in range(self.side):
            color = self.m[i,k]
            self.remove_from_color_lists(i,k,color)
            color = self.m[k,j]
            self.remove_from_color_lists(k,j,color)


        color = self.m[i,j]
        for x in self.color_lists[color]:
            self.crossed[x[0],x[1]] = True
        self.color_lists[color] = []



    def solve(self):
        #Pick a color
        color = self.get_less_populated_color()
        if color == -1:
            return(True)

        colors_lists = copy.deepcopy(self.color_lists)
        crossed = copy.deepcopy(self.crossed)
        
        for k in range(len(self.color_lists[color])):
            i,j = self.color_lists[color][k][0],self.color_lists[color][k][1]
            q = self.queen(i,j)
            if q and self.solve():
                self.crowns[i,j] = True
                self.found_crowns+=1
                return(True)
            else:
                self.color_lists = copy.deepcopy(colors_lists)
                self.crossed = copy.deepcopy(crossed)
        return(False) #no square can be queened for this color, go up in recursion tree
    
    
    def queen(self,i,j):
        e = self.count_empty_colors()
        self.cross_out(i,j)
        if self.count_empty_colors()>e+1:
            return(False)
        return(True)

    def count_empty_colors(self):
        return(sum([1 if self.color_lists[i]==[] else 0 for i in range(self.side)]))


"""
matrix = np.array([[0,1,1,1,2,3,3,3,3],[0,1,2,1,2,3,4,4,4],[0,1,2,2,2,3,3,4,4],[0,5,5,5,6,6,6,4,4],[0,5,0,5,6,7,7,7,4],[0,0,0,8,6,6,6,7,4],[8,8,8,8,8,8,7,7,4],[8,8,8,8,8,8,4,4,4],[8,8,8,8,8,8,8,8,8]])
print(matrix)
solver = QueensSolver(matrix=matrix)
s = solver.solve()
print(solver.crowns)
"""


class TangoSolver():
    def __init__(self,matrix,vertical,horizontal) -> None:
        self.m = matrix
        self.v = vertical
        self.h = horizontal
        self.side = len(matrix[0])
    
    def isrankok(self,i):
        m = 0
        s = 0
        minrow = 0
        sinrow = 0
        for j in range(self.side):
            if self.m[i,j]==-1:
                m+=1
                minrow+=1
                sinrow=0
            elif self.m[i,j]==1:
                s+=1
                sinrow+=1
                minrow=0
            elif self.m[i,j]==0:
                sinrow,minrow=0,0
            if minrow>=3 or sinrow>=3:
                return(False)
        if m>3 or s>3:
            return(False)
        return(True)
    
    def isfileok(self,j):
        m = 0
        s = 0
        minrow = 0
        sinrow = 0
        for i in range(self.side):
            if self.m[i,j]==-1:
                m+=1
                minrow+=1
                sinrow=0
            elif self.m[i,j]==1:
                s+=1
                sinrow+=1
                minrow=0
            elif self.m[i,j]==0:
                sinrow,minrow=0,0
            if minrow>=3 or sinrow>=3:
                return(False)
        if m>3 or s>3:
            return(False)
        return(True)
    
    def tango(self,i,j,symbol):

        if self.m[i,j]==0:
            self.m[i,j] = symbol

            if not self.isfileok(j) or not self.isrankok(i):
                return(False)
            
            [cg,cd] = self.h[i][j]
            [ch,cb] = self.v[i][j]

            bg,bd,bb,bh=True,True,True,True

            if cg==-1: #not
                bg = self.tango(i,j-1,-symbol)
            elif cg==1: #equals
                bg = self.tango(i,j-1,symbol)
            if cd==-1:
                bd = self.tango(i,j+1,-symbol)
            elif cd==1:
                bd = self.tango(i,j+1,symbol)
            if cb==-1: #not
                bb = self.tango(i+1,j,-symbol)
            elif cb==1: #equals
                bb = self.tango(i+1,j,symbol)
            if ch==-1:
                bh = self.tango(i-1,j,-symbol)
            elif ch==1:
                bh = self.tango(i-1,j,symbol)

            return(bg and bd and bb and bh)

        elif self.m[i,j]==symbol:
            return(True)
            
        else:
            return(False)
    
    def full(self):
        return(np.count_nonzero(self.m) == self.side**2)
    
    def get_nonzero_position(self):
        for i in range(self.side):
            for j in range(self.side):
                if self.m[i,j]==0:
                    return(i,j)

    def solve(self):
        #Tant qu'il y a des 0 dans la matrice, choisir un zéro au hasard
        #Essayer de mettre un soleil. Si tango revient faux, annuler les changements et mettre une lune
        if self.full():
            return(True)
        else:
            matrix = copy.deepcopy(self.m)
            i,j = self.get_nonzero_position()
            if self.tango(i,j,1) and self.solve():
                return(True)
            else:
                self.m = copy.deepcopy(matrix)
            if self.tango(i,j,-1) and self.solve():
                return(True)
            else:
                self.m = copy.deepcopy(matrix)

            return(False)
"""
#Test
matrix = np.array([[0,0,0,0,0,0],[0,0,0,-1,0,-1],[0,0,-1,0,1,0],[0,1,0,-1,0,0],[1,0,1,0,0,0],[0,0,0,0,0,0]])
h = [[[0,0],[0,-1],[-1,0],[0,0],[0,0],[0,0]],[[0,1],[1,0],[0,0],[0,0],[0,0],[0,0]],[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],[[0,0],[0,0],[0,0],[0,0],[0,-1],[-1,0]],[[0,0],[0,0],[0,0],[0,1],[1,0],[0,0]]]
v = [[[0,0],[0,-1],[0,0],[0,0],[0,0],[0,0]],[[0,1],[-1,0],[0,0],[0,0],[0,0],[0,0]],[[1,0],[0,0],[0,0],[0,0],[0,0],[0,0]],[[0,0],[0,0],[0,0],[0,0],[0,0],[0,1]],[[0,0],[0,0],[0,0],[0,0],[0,-1],[1,0]],[[0,0],[0,0],[0,0],[0,0],[0,0],[-1,0],[0,0]]]
#print(matrix,h,v)
solver = TangoSolver(matrix=matrix,vertical=v,horizontal=h)
s = solver.solve()
print(solver.m)
"""