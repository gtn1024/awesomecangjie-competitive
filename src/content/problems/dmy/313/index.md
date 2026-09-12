---
oj: dmy
pid: '313'
title: '[R50E]数据同步'
difficulty: 提高
tags:
  - 图论
  - 函数图
  - 拓扑排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 2 \times 10^5$，$1 \le X_i \le n$，$X_i \ne i$，$1 \le C_i \le 10^9$。

## 思路

把服务器看作点，把 $i$ 指向 $X_i$ 的同步关系看作一条代价为 $C_i$ 的有向边。每个点恰好有一条出边，因此整张图是一张 **函数图**：每个弱连通分量都由一个环和若干棵指向环的树组成。

先考虑树边。一旦确定树根所在的数据中心，就可以沿树逐层交替分配数据中心，使每条树边的两个端点都位于不同的数据中心。因此所有树边都可以做到不产生费用，答案只取决于环。

对于一个长度为 $k$ 的环：

- 若 $k$ 为偶数，沿环交替分配数据中心，可以使所有环边的两个端点都不同，该环贡献 $0$；
- 若 $k$ 为奇数，不可能让每条环边的两个端点都不同，所以至少有一条环边需要付费。任选一条环边作为唯一一条同组边，其余位置沿环交替分配，就能让其他环边全部免费。因此只需选择环上代价最小的边，该环贡献 $\min C_i$。

于是答案就是所有奇环上的最小边权之和。

为了找到所有环，先统计每个点的入度，将入度为 $0$ 的点入队。不断删除队首点的出边，并在后继入度变为 $0$ 时将其入队。这个过程会删除所有非环点，最后入度仍大于 $0$ 的点恰好是环上的点。

随后从每个尚未访问的环上点出发，沿出边走一周，统计环长和环上最小代价。代码直接把访问过的环上点入度清零，同时完成去重。

## 复杂度

每个点和每条边都只处理常数次，时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let next = Array<Int64>(n, { _ => 0 })
    let cost = Array<Int64>(n, { _ => 0 })
    let indegree = Array<Int64>(n, { _ => 0 })

    for (i in 0..n) {
        let input = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        next[i] = input[0] - 1
        cost[i] = input[1]
        indegree[next[i]] += 1
    }

    let queue = Array<Int64>(n, { _ => 0 })
    var head: Int64 = 0
    var tail: Int64 = 0
    for (i in 0..n) {
        if (indegree[i] == 0) {
            queue[tail] = i
            tail += 1
        }
    }

    while (head < tail) {
        let u = queue[head]
        head += 1
        let v = next[u]
        indegree[v] -= 1
        if (indegree[v] == 0) {
            queue[tail] = v
            tail += 1
        }
    }

    var answer: Int64 = 0
    for (i in 0..n) {
        if (indegree[i] > 0) {
            var length: Int64 = 0
            var minimum = cost[i]
            var u = i
            while (indegree[u] > 0) {
                indegree[u] = 0
                length += 1
                if (cost[u] < minimum) {
                    minimum = cost[u]
                }
                u = next[u]
            }
            if (length % 2 == 1) {
                answer += minimum
            }
        }
    }

    println(answer)
}
```
