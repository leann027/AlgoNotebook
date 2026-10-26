export interface AlgorithmFlashQuiz {
  question: string;
  answer: string;
  hint: string;
}

/**
 * Preguntas de Laboratorio y Desafíos Conceptuales para el estudio de algoritmos
 */
export const ALGORITHM_FLASH_QUIZZES: Record<string, AlgorithmFlashQuiz> = {
  'bubble-sort': {
    question: '¿Por qué Bubble Sort tiene mejor caso O(N) solo si se implementa una bandera de intercambios?',
    answer:
      'Sin la bandera booleana hasSwapped, el bucle for doble ejecuta invariablemente las n(n-1)/2 comparaciones cuadráticas. Con la bandera, si en la primera pasada no hubo ningún intercambio, detecta en O(N) que el arreglo ya está ordenado y retorna de inmediato.',
    hint: 'Piensa en qué ocurre cuando el arreglo ya viene completamente ordenado desde el inicio.',
  },
  'insertion-sort': {
    question: '¿Por qué Insertion Sort supera a algoritmos O(N log N) en arreglos pequeños o casi ordenados?',
    answer:
      'Posee una sobrecarga por constante mínima, no genera marcos de llamada recursiva (cero call stack overhead), y sobre listas casi ordenadas su bucle interno termina en O(1) operaciones por elemento, logrando complejidad lineal O(N) in-place.',
    hint: 'Evalúa la cantidad de comparaciones necesarias cuando cada elemento está a pocas posiciones de su lugar final.',
  },
  'selection-sort': {
    question: '¿Por qué Selection Sort realiza siempre O(N²) comparaciones incluso si el arreglo ya está ordenado?',
    answer:
      'Porque en cada pasada i debe inspeccionar obligatoriamente todos los elementos desde i+1 hasta n-1 para poder certificar con certeza matemática cuál es el elemento mínimo absoluto del sufijo antes de realizar el intercambio.',
    hint: 'Observa la condición de salida del bucle interno j: ¿se interrumpe antes de llegar al final?',
  },
  'quick-sort': {
    question: '¿Por qué la partición de Lomuto con pivote en arr[high] degenera a O(N²) con datos ordenados?',
    answer:
      'Si el arreglo está ordenado y el pivote es el último elemento, el pivote siempre resulta ser el mayor de todos. Esto produce particiones severamente asimétricas de tamaños 0 y N-1 en cada nivel, generando una pila recursiva de profundidad N en vez de log N.',
    hint: 'Analiza qué tamaños tienen los dos subarreglos izquierdo y derecho tras particionar un arreglo ordenado.',
  },
  'merge-sort': {
    question: '¿Por qué Merge Sort requiere O(N) de memoria auxiliar en arreglos pero solo O(1) en listas enlazadas?',
    answer:
      'En arreglos contiguos, la fase de mezcla necesita un buffer temporal para no sobreescribir los elementos que aún no han sido procesados. En listas enlazadas, los punteros next pueden redirigirse in-place sin necesidad de duplicar memoria.',
    hint: 'Considera cómo se almacenan contiguamente los datos en RAM versus nodos enlazados por punteros.',
  },
  'binary-search': {
    question: '¿Por qué se prefiere calcular mid = low + (high - low) / 2 sobre (low + high) / 2?',
    answer:
      'Para prevenir el desbordamiento de enteros (Integer Overflow) en lenguajes fuertemente tipados como C o Java. Si low + high supera 2³¹-1 (INT_MAX), el resultado se vuelve un número negativo incorrecto.',
    hint: 'Recuerda el límite superior de enteros con signo de 32 bits.',
  },
  'bst-insertion': {
    question: '¿Qué ocurre con la topología del BST si se insertan claves en orden secuencial estrictamente creciente?',
    answer:
      'El árbol degenera en una lista enlazada unidireccional inclinada hacia la derecha con altura H = N. Esto anula la eficiencia logarítmica O(log N) de búsqueda e inserción, degradando todas las operaciones a tiempo lineal O(N).',
    hint: 'Visualiza qué rama (izquierda o derecha) se elige en cada inserción consecutiva mayor que la anterior.',
  },
  'inorder-traversal': {
    question: '¿Por qué el recorrido Inorder (Izquierda-Raíz-Derecha) sobre un BST emite las claves en orden ascendente?',
    answer:
      'Por la propiedad invariante fundamental del BST: para todo nodo x, todas las claves del subárbol izquierdo son estrictamente menores que x, y todas las del derecho son mayores. La secuencia Izq → Raíz → Der visita axiomáticamente en orden creciente.',
    hint: 'Revisa la definición formal del invariante de ordenación en el nodo raíz.',
  },
  'preorder-traversal': {
    question: '¿Cuál es la principal ventaja práctica de almacenar un árbol utilizando recorrido Preorder?',
    answer:
      'Permite clonar o serializar la estructura topológica del árbol para guardarla en disco y reconstruir idénticamente el mismo árbol binario original deserializándolo secuencialmente de arriba hacia abajo.',
    hint: 'Piensa en qué nodo necesitas conocer primero para reconstruir la raíz de un árbol binario.',
  },
  'min-heap': {
    question: '¿Cómo calcula un montículo binario las posiciones de hijo y padre dentro de un arreglo lineal contiguo?',
    answer:
      'Para cualquier nodo en índice i: su hijo izquierdo está en 2i + 1, su hijo derecho en 2i + 2, y su nodo padre en floor((i - 1) / 2). Esto permite representar árboles completos balanceados sin gastar punteros de memoria.',
    hint: 'Las propiedades de árbol binario completo permiten indexación aritmética pura.',
  },
  'bfs-graph': {
    question: '¿Por qué BFS garantiza encontrar el camino con la menor cantidad de aristas en grafos no ponderados?',
    answer:
      'Porque explora sistemáticamente los vértices en anillos concéntricos por niveles de distancia métrica usando una cola FIFO. Todos los nodos a distancia k aristas se visitan obligatoriamente antes de descubrir cualquier nodo a distancia k+1.',
    hint: 'Considera la disciplina de atención Primero en Entrar, Primero en Salir (FIFO) de la cola.',
  },
  'dfs-graph': {
    question: '¿Cuál es la estructura de datos responsable del retroceso (backtracking) en DFS recursivo?',
    answer:
      'La pila de llamadas del sistema (Call Stack). Cada marco de activación almacena el vértice activo y el iterador de sus vecinos, permitiendo reanudar la búsqueda al retornar de una rama agotada.',
    hint: '¿Dónde se guardan las variables locales y el punto de retorno cuando una función se llama a sí misma?',
  },
  'dijkstra-graph': {
    question: '¿Por qué Dijkstra falla categóricamente o entra en bucles infinitos si existen aristas con pesos negativos?',
    answer:
      'Dijkstra se basa en el principio voraz (Greedy): una vez que un nodo u es marcado como permanentemente asentado (dist[u] final), asume que ninguna ruta futura podrá ser más corta. Un peso negativo posterior violaría este invariante.',
    hint: 'Revisa el momento exacto en que un nodo pasa al conjunto cerrado de distancias asentadas.',
  },
  'kruskal-graph': {
    question: '¿Cómo evita Kruskal la formación de ciclos al evaluar cada arista ponderada candidata?',
    answer:
      'Utiliza una estructura de conjuntos disjuntos (DSU / Union-Find). Si find(u) == find(v), ambos extremos ya pertenecen al mismo árbol conexo y añadir la arista formaría un ciclo; de lo contrario, se acepta en el MST y se ejecuta union(u, v).',
    hint: 'Piensa en verificar si dos vértices ya tienen un ancestro representativo común.',
  },
  'knapsack-dp': {
    question: '¿Por qué el enfoque voraz (Greedy) por ratio valor/peso falla en la Mochila 0/1 pero sirve en la fraccionaria?',
    answer:
      'Porque en la Mochila 0/1 los ítems son indivisibles (todo o nada). Una decisión greedy puede llenar la capacidad dejando un espacio ocioso que no se puede aprovechar, mientras que un conjunto alternativo de ítems menos densos lograría un valor total superior.',
    hint: 'Recuerda que no puedes partir un objeto para que quepa exactamente en el peso restante.',
  },
  'lcs-dp': {
    question: '¿Cómo se reconstruye la subsecuencia común resultante a partir de la matriz bidimensional calculada?',
    answer:
      'Haciendo un traceback desde dp[m][n] hacia dp[0][0]: si S1[i-1] == S2[j-1], el carácter pertenece a la subsecuencia y se retrocede diagonalmente a dp[i-1][j-1]; de lo contrario, se retrocede hacia la celda vecina con el mayor valor.',
    hint: 'Sigue hacia atrás las decisiones que originaron el valor máximo acumulado en cada celda.',
  },
  'coin-change-dp': {
    question: '¿Por qué el cambio de monedas con denominaciones [1, 3, 4] y cantidad 6 falla con una heurística Greedy?',
    answer:
      'Greedy tomaría primero la moneda mayor 4, necesitando luego dos monedas de 1 para sumar 6 (total: 3 monedas: 4+1+1). La programación dinámica encuentra la solución óptima global: dos monedas de 3 (total: 2 monedas: 3+3).',
    hint: 'Calcula cuántas monedas se usan tomando la más grande disponible versus combinar denominaciones intermedias.',
  },
  'reverse-linked-list': {
    question: '¿Cuáles son los 3 punteros necesarios para invertir una lista enlazada in-place sin perder nodos?',
    answer:
      'prev (inicialmente NULL), curr (nodo en proceso) y next (apunta al siguiente nodo para guardar su dirección antes de reasignar curr->next = prev). Sin next, el resto de la lista quedaría huérfana en memoria.',
    hint: '¿Qué puntero necesitas respaldar antes de sobreescribir el enlace curr->next?',
  },
  'cycle-detection': {
    question: '¿Por qué el puntero liebre (2 pasos) y tortuga (1 paso) garantizan encontrarse sin saltarse mutuamente?',
    answer:
      'Porque dentro de un ciclo de longitud C, la distancia relativa entre ambos disminuye exactamente en 1 unidad en cada paso temporal (2 - 1 = 1). Al ser una reducción unitaria discreta, la distancia alcanzará forzosamente el valor 0.',
    hint: 'Calcula la velocidad relativa entre ambos punteros en cada iteración del bucle.',
  },
  'stack-operations': {
    question: '¿Cuáles son las condiciones formales de Stack Overflow y Stack Underflow?',
    answer:
      'Stack Overflow ocurre al intentar hacer push cuando el puntero de cima top == capacity - 1 en un arreglo de tamaño fijo. Stack Underflow ocurre al intentar pop o peek cuando la pila está vacía (top == -1).',
    hint: 'Examina los valores extremos del índice centinela top.',
  },
  'queue-operations': {
    question: '¿Por qué una cola implementada sobre un arreglo estático requiere indexación circular modulo MAX?',
    answer:
      'Porque a medida que se realizan enqueue y dequeue, los punteros front y rear avanzan hacia el final del arreglo. El operador módulo (idx + 1) % MAX permite reutilizar los espacios libres al inicio sin tener que desplazar elementos.',
    hint: 'Piensa en qué sucede cuando rear llega al índice final del arreglo pero el frente ya fue vaciado.',
  },
  'insert-linked-list': {
    question: '¿Por qué la inserción al final de una lista simplemente enlazada toma O(N) sin puntero tail y O(1) con él?',
    answer:
      'Sin un puntero tail explícito, es obligatorio recorrer secuencialmente desde head hasta el último nodo verificando curr->next == NULL, lo que requiere N pasos. Manteniendo una referencia tail, la conexión tail->next = nuevo se ejecuta en tiempo constante O(1).',
    hint: 'Considera cuántos nodos debes atravesar para ubicar el enlace final.',
  },
  'linear-binary-search': {
    question: '¿Por qué la Búsqueda Binaria requiere que el arreglo esté estrictamente ordenado mientras que la Búsqueda Lineal no?',
    answer:
      'La búsqueda binaria descarta el 50% del espacio de búsqueda en cada paso evaluando si el objetivo es menor o mayor que arr[mid]. Si los datos no están ordenados, esta decisión de descarte es matemáticamente inválida y podría omitir el elemento buscado. La búsqueda lineal inspecciona secuencialmente cada posición en O(N) sin asumir ninguna relación de orden.',
    hint: 'Considera en qué propiedad matemática se fundamenta el descarte de mitades en cada comparación.',
  },
  'priority-queue': {
    question: '¿Por qué una cola de prioridad basada en min-heap realiza inserción en O(log N) y extracción en O(log N) en lugar de O(1)?',
    answer:
      'Para mantener el invariante de montículo (la clave del padre es menor o igual a la de sus hijos) y la estructura de árbol completo, la inserción coloca el elemento al final y ejecuta sift-up subiendo por la altura h = floor(log₂ N), y la extracción reemplaza la raíz con el último elemento y ejecuta sift-down hacia abajo.',
    hint: 'Visualiza la trayectoria que recorre un nuevo elemento desde la última hoja hasta su posición balanceada.',
  },
  'kadane': {
    question: '¿Cuál es la subestructura óptima y la ecuación de Bellman que fundamenta el algoritmo de Kadane en O(N)?',
    answer:
      'La ecuación de programación dinámica es M(i) = max(A[i], M(i-1) + A[i]), donde M(i) es la máxima subsuma de cualquier subarreglo contiguo que termina exactamente en el índice i. Si la suma previa M(i-1) es negativa, reiniciar en A[i] es estrictamente superior a arrastrar un déficit.',
    hint: 'Piensa en cuándo conviene extender el subarreglo previo versus iniciar un nuevo subarreglo en la posición actual.',
  },
  'topological-sort': {
    question: '¿Por qué el algoritmo de Kahn para ordenamiento topológico falla si el grafo contiene al menos un ciclo dirigido?',
    answer:
      'Porque ningún vértice perteneciente a un ciclo dirigido puede alcanzar jamás un grado de entrada (in-degree) igual a cero. En consecuencia, la cola de Kahn se vacía antes de procesar todos los vértices (|procesados| < |V|), lo que sirve simultáneamente como demostración constructiva y detector formal de ciclos.',
    hint: 'Evalúa qué vértice de un ciclo simple u -> v -> w -> u podría tener in-degree 0 para ingresar a la cola.',
  },
  'avl-tree': {
    question: '¿Por qué un árbol AVL garantiza búsquedas en O(log N) mientras que un BST estándar puede degradar a O(N)?',
    answer:
      'Porque el árbol AVL impone el invariante de balance estricto: para todo nodo, la diferencia de alturas |h(izq) - h(der)| ≤ 1. Si una inserción o borrado viola esta condición (factor ±2), se ejecutan rotaciones automáticas (LL, RR, LR, RL) en O(1), asegurando una cota superior de altura de h < 1.4404 log₂(N+2) ligada a los números de Fibonacci.',
    hint: 'Recuerda la relación entre la altura del árbol y la peor degradación de un árbol binario en lista enlazada.',
  },
  'bellman-ford': {
    question: '¿Por qué el algoritmo de Bellman-Ford ejecuta |V| - 1 pasadas de relajación y una |V|-ésima pasada adicional?',
    answer:
      'Cualquier camino simple más corto contiene a lo sumo |V| - 1 aristas, por lo que |V| - 1 pasadas garantizan propagar la distancia óptima a todos los vértices. La |V|-ésima pasada adicional se usa para verificar si alguna distancia dist[v] todavía disminuye; si disminuye, prueba formalmente la existencia de un ciclo de coste negativo alcanzable.',
    hint: 'Considera la cantidad máxima de aristas en un camino sin ciclos y qué ocurre si una distancia continúa decreciendo indefinidamente.',
  },
  'levenshtein-distance': {
    question: '¿Cuáles son las 3 transiciones posibles en la relación de recurrencia de la matriz de distancia de Levenshtein D(i, j)?',
    answer:
      'Las tres operaciones elementales de edición son: 1) Inserción: D(i, j-1) + 1 (moverse a la derecha). 2) Eliminación: D(i-1, j) + 1 (moverse hacia abajo). 3) Sustitución: D(i-1, j-1) + costo, donde el costo es 0 si S1[i] == S2[j] (match) o 1 si difieren (mismatch diagonal).',
    hint: 'Examina las tres celdas vecinas (izquierda, arriba y diagonal superior izquierda) que alimentan a D(i, j).',
  },
  'strongly-connected-components': {
    question: '¿Cómo utiliza el algoritmo de Tarjan los valores discovery time (disc) y low-link (low) para identificar la raíz de una componente fuertemente conexa?',
    answer:
      'disc[u] marca el orden temporal en que se descubrió u en el DFS, y low[u] es el menor disc alcanzable a través de aristas de árbol y aristas de retroceso en la pila. Cuando low[u] == disc[u], u es el nodo raíz de una SCC maximal; desapilar todos los vértices hasta u extrae la componente completa sin recalcular caminos.',
    hint: 'Analiza qué condición se cumple cuando un nodo no puede alcanzar a ningún ancestro descubierto antes que él.',
  },
};
