---
oj: dmy
pid: '510'
title: '[R80E] 陈列记录'
difficulty: 提高+
tags:
  - 构造
  - 拓扑排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 2\times 10^5$，对每个 $1 \le i \le n-2$ 都有 $i \le m_i \le i+2$。

## 思路

把大小关系建成有向图：$p_u<p_v$ 记为一条边 $u\to v$。只要这张图无环，任取一个拓扑序，把拓扑序中的第 $k$ 个位置赋成 $k$，所有边就都成立，由边传递出的路径关系也一并成立。于是任务变成：只加必要的边，保证图始终无环，并让每条记录成立。

第 $i$ 条记录只涉及位置 $i,i+1,i+2$。从前往后逐条处理，处理到第 $i$ 条时，$p_i$ 与 $p_{i+1}$ 的大小关系已经由之前加的边（直接或传递）确定，只有新位置 $z=i+2$ 与它们的关系需要新加边。用布尔量 $b$ 记录当前是否有 $p_i<p_{i+1}$。

第 $1$ 条记录决定了 $b$：若 $m_1=1$，则 $p_1$ 是中位数，无论 $p_3$ 比 $p_1$ 大还是小，都有 $p_2>p_1$，所以 $b=\mathsf{false}$，加边 $2\to1$；若 $m_1\ne1$，即 $m_1\in\{2,3\}$，同理都有 $p_1<p_2$，所以 $b=\mathsf{true}$，加边 $1\to2$。这里的相对顺序是被输入唯一确定的，不是任取。

下面处理第 $i$ 条记录。记 $x=i$，$y=i+1$，$z=i+2$，$\mathit{mid}=m_i-i\in\{0,1,2\}$ 指明中位数是三者中的哪一个。

- $\mathit{mid}=2$，即 $z$ 是中位数：$z$ 必须夹在 $x$ 与 $y$ 之间。若 $b$ 为真（$p_x<p_y$），加边 $x\to z$、$z\to y$；否则加边 $y\to z$、$z\to x$。
- $\mathit{mid}\in\{0,1\}$，即 $z$ 是最大或最小的那个：若 $b$ 为真，$p_x<p_y$，那么 $\mathit{mid}=1$ 时三元组只能是 $p_x<p_y<p_z$（$z$ 最大），$\mathit{mid}=0$ 时只能是 $p_z<p_x<p_y$（$z$ 最小）；若 $b$ 为假，三种取值同理全部确定。此时只需把 $z$ 与 $x$、$y$ 都连边：$z$ 最大就加 $x\to z$、$y\to z$，$z$ 最小就加 $z\to x$、$z\to y$。

两条分支可以合并：$z$ 同时大于 $x$ 与 $y$，当且仅当 $(\mathit{mid}=1)=b$；处理完这条记录后，新的 $b$（即 $p_{i+1}<p_{i+2}$）在 $\mathit{mid}=1$ 时保持不变（$y$ 夹在中间，$p_y<p_z$ 与 $p_x<p_y$ 同真假），在 $\mathit{mid}\ne1$ 时取反（$z$ 跑到 $y$ 的另一侧）。

## 正确性

- **图始终无环。** 每一步新加的边都只把新位置 $z$ 与 $x$、$y$ 相连，并且这些边描述的都是同一个全序（$z$ 最小、$z$ 居中或 $z$ 最大三种情况之一）。假设处理前图有一个线性序，按 $z$ 在三种情况中对应的位置把它插入到 $x$、$y$ 之间或两端，就得到新图的一个线性序。线性序存在则无环，归纳可知整张图始终无环。
- **每条记录都被满足。** 处理第 $i$ 条记录时，$x$ 与 $y$ 的旧关系已知，新加的两条边再定下 $z$ 的位置，三者的大小顺序已经完整确定，$p_{m_i}$ 恰是中位数；剩下的那一组比较由已加边的传递性推出。同时新的 $b$ 正确记录了 $p_{i+1}$ 与 $p_{i+2}$ 的关系，供下一条记录使用。
- **后续步骤不会破坏前面的记录。** 后面的记录只会引入新位置并增加边，不会删除或反向任何已有边；最终的赋值是整个图的线性序，因此前面各条记录涉及的三元组大小关系原样保持。

所以对任何合法输入都一定能构造出排列，不存在输出 $-1$ 的情况。最后对整张图跑一遍拓扑排序，按出队顺序把位置赋成 $1,2,\ldots,n$ 即可。

## 复杂度

时间 $O(n)$，空间 $O(n)$。边数至多 $2(n-2)+1$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

func addEdge(edges: Array<ArrayList<Int64>>, indeg: Array<Int64>, a: Int64, b: Int64) {
    edges[a].add(b)
    indeg[b] += 1
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let m = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ s: String => Int64.parse(s) })
    let size = n + 1
    let edges = Array<ArrayList<Int64>>(size, { _ => ArrayList<Int64>() })
    let indeg = Array<Int64>(size, { _ => 0 })
    var increasing = m[0] != 1
    if (increasing) {
        addEdge(edges, indeg, 1, 2)
    } else {
        addEdge(edges, indeg, 2, 1)
    }
    for (i in 1..=n - 2) {
        let x = i
        let y = i + 1
        let z = i + 2
        let middle = m[i - 1] - i
        if (middle == 2) {
            if (increasing) {
                addEdge(edges, indeg, x, z)
                addEdge(edges, indeg, z, y)
            } else {
                addEdge(edges, indeg, y, z)
                addEdge(edges, indeg, z, x)
            }
        } else {
            let newIsLarger = (middle == 1) == increasing
            if (newIsLarger) {
                addEdge(edges, indeg, x, z)
                addEdge(edges, indeg, y, z)
            } else {
                addEdge(edges, indeg, z, x)
                addEdge(edges, indeg, z, y)
            }
        }
        if (middle != 1) {
            increasing = !increasing
        }
    }
    let ans = Array<Int64>(size, { _ => 0 })
    let queue = Array<Int64>(size, { _ => 0 })
    var head = 0
    var tail = 0
    for (i in 1..=n) {
        if (indeg[i] == 0) {
            queue[tail] = i
            tail += 1
        }
    }
    while (head < tail) {
        let v = queue[head]
        ans[v] = head + 1
        for (u in edges[v]) {
            indeg[u] -= 1
            if (indeg[u] == 0) {
                queue[tail] = u
                tail += 1
            }
        }
        head += 1
    }
    for (i in 1..=n) {
        if (i > 1) {
            print(" ")
        }
        print(ans[i])
    }
    println()
}
```

</details>
