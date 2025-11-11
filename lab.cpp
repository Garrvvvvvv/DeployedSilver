#include <bits/stdc++.h>
using namespace std;
void BFS(int start, vector<vector<int>>& matrix) {
    int n = matrix.size();
    vector<bool> visited(n, false);
    queue<int> q;
    visited[start] = true;
    q.push(start);
    cout << "starting from node " << start << ": ";
    while (!q.empty()) {
        int node = q.front();
        q.pop();
        cout << node << " ";
        for (int j = 0; j < n; j++) {
            if (matrix[node][j] == 1 && !visited[j]) {
                visited[j] = true;
                q.push(j);
            }
        }
    }
    cout << endl;
}
int main() {
    int V, E;
    cout << "Enter number of vertices and edges: ";
    cin >> V >> E;
    vector<vector<int>> matrix(V, vector<int>(V, 0));
    cout << "Enter edges (u v):" << endl;
    for (int i = 0; i < E; i++) {
        int u, v;
        cin >> u >> v;
        matrix[u][v] = 1;
        matrix[v][u] = 1; 
    }
    int start;
    cout << "Give me  starting node: ";
    cin >> start;
    BFS(start, matrix);
    return 0;
}
