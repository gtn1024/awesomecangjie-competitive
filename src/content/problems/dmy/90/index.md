---
oj: dmy
pid: '90'
title: '[R15F] 树上炸弹'
difficulty: 普及+/提高
tags:
  - 树
  - 动态规划
  - 树上差分
  - 倍增
timeLimit: 3s
memoryLimit: 512m
---

> 数据规模：$1 \le n,m \le 5\times 10^5$，$1 \le u_i,v_i,p_i \le n$，$1 \le w_i \le 50$。$40\%$ 的数据 $n,m\le 5000$。

## 思路

朴素做法是对每个炸弹从 $p_i$ 出发 BFS/DFS，给所有满足 $\text{dis}(p_i,j)\le w_i$ 的节点 $j$ 的答案加 $1$，复杂度 $O(nm)$，只能拿 $40\%$。注意到 $w_i\le 50$ 很小，这是关键突破口。

把树转为以节点 $1$ 为根的有根树。记 $\text{fa}(x,i)$ 为 $x$ 向根方向走 $i$ 步到达的节点（走不到根则记为 $0$）。分析在节点 $x$ 放一个范围 $w$ 的炸弹的影响：被波及的节点是从 $x$ 出发、距离不超过 $w$ 的所有点。把这些点按「离根最近的公共祖先」归类，可以拆成至多 $w+1$ 段沿祖先链的「子树内、距某祖先不超过某值」的集合。

具体地，沿 $x$ 向上枚举步数 $j=0,1,\dots,w$（设 $y=\text{fa}(x,j)$）：

- 当 $j=0$：$x$ 子树内距 $x$ 不超过 $w$ 的节点全部被炸，即 $f[x][w]+=1$。
- 当 $0<j<w$ 且 $y\neq 0$：$y$ 子树内距 $y$ 不超过 $w-j$ 的节点全部被炸，但这会重复计入已经处理过的 $x$ 那一支（即 $\text{fa}(x,j-1)$ 子树）。所以先 $f[y][w-j]+=1$，再用树上差分抵消：令 $\text{fa}(x,j-1)$ 子树内距它不超过 $w-j-1$ 的节点少被炸一次，即 $f[\text{fa}(x,j-1)][w-j-1]-=1$。
- 当 $j=w$ 且 $y\neq 0$：只剩祖先 $y$ 自己被炸，即 $f[y][0]+=1$。

这里 $f[x][i]$ 的含义是「$x$ 子树内、距 $x$ 不超过 $i$ 的节点统一加上的标记值」。每个炸弹只需沿父链向上走至多 $w\le 50$ 步，因此处理所有炸弹是 $O(50m)$。

标记定义完后，做一次自根向下的 DFS 推导真实贡献：对每个节点 $x$，有 $f[x][i] \mathrel{+}= f[\text{parent}(x)][i+1]$（$0\le i<50$）。这条转移的含义是：父节点处「距父不超过 $i+1$」的标记，传播到 $x$ 处正好对应「距 $x$ 不超过 $i$」。按 BFS 序（父先于子）顺序遍历即可，无需递归。

最后每个节点 $i$ 的答案就是 $\sum_{j=0}^{50} f[i][j]$。总复杂度 $O(50(m+n))$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let line1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line1[0]
    let m = line1[1]
    let nn = n

    // 邻接表 (1-indexed), 用 CSR 式数组节省内存
    var head = Array<Int64>(nn + 2, { _ => -1 })
    var toArr = Array<Int64>(2 * nn, { _ => 0 })
    var nxt = Array<Int64>(2 * nn, { _ => -1 })
    var ecnt = 0
    func addEdge(u: Int64, v: Int64): Unit {
        toArr[ecnt] = v
        nxt[ecnt] = head[u]
        head[u] = Int64(ecnt)
        ecnt++
    }
    var i = 0
    while (i < n - 1) {
        let e = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        addEdge(e[0], e[1])
        addEdge(e[1], e[0])
        i++
    }

    // BFS 建立有根树, parent[1]=0; order 记录 BFS 顺序 (父先于子)
    let parent = Array<Int64>(nn + 1, { _ => 0 })
    let order = Array<Int64>(nn, { _ => 0 })
    var ohead = 0
    var otail = 0
    order[otail] = 1
    otail++
    parent[1] = 0
    while (ohead < otail) {
        let u = order[ohead]
        ohead++
        var e = head[u]
        while (e != -1) {
            let v = toArr[e]
            if (v != parent[u]) {
                parent[v] = u
                order[otail] = v
                otail++
            }
            e = nxt[e]
        }
    }

    // f[x][i], i in 0..50, 共 51 列. 扁平存储: f[x*W + i]
    // 用 Int32 减小内存 (5e5 * 51 * 4 ≈ 102MB)
    let W = 51
    let stride = Int64(W)
    let f = Array<Int32>((nn + 1) * W, { _ => 0 })

    // 处理每个炸弹: 沿父链向上走, 用差分抵消子树内重复部分
    var bi = 0
    while (bi < m) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let p = parts[0]
        let w = parts[1]
        var cur = p
        var rem = w
        var bc = Int64(cur) * stride + rem
        f[bc] = f[bc] + 1
        while (rem > 0) {
            let child = cur
            cur = parent[cur]
            rem -= 1
            if (cur == 0) {
                break
            }
            if (rem > 0) {
                let baseCur = Int64(cur) * stride
                let baseChild = Int64(child) * stride
                let p1 = baseCur + rem
                f[p1] = f[p1] + 1
                let p2 = baseChild + rem - 1
                f[p2] = f[p2] - 1
            } else {
                let baseCur = Int64(cur) * stride
                f[baseCur] = f[baseCur] + 1
                break
            }
        }
        bi++
    }

    // 自顶向下传播: f[x][i] += f[parent][i+1], i in 0..49
    // order 是 BFS 顺序, 顺序遍历即父先于子
    var oi = 1  // 跳过根 1
    while (oi < nn) {
        let x = order[oi]
        let par = parent[x]
        var offX = Int64(x) * stride
        var offP = Int64(par) * stride
        var ii = 0
        while (ii < 50) {
            f[offX] = f[offX] + f[offP + 1]
            offX += 1
            offP += 1
            ii++
        }
        oi++
    }

    // ans[x] = sum_i f[x][i]
    var xi = 1
    while (xi <= nn) {
        var s = Int64(0)
        var off = Int64(xi) * stride
        var ii = 0
        while (ii < W) {
            s += Int64(f[off])
            off += 1
            ii++
        }
        if (xi > 1) {
            print(" ")
        }
        print(s)
        xi++
    }
    println()
}
```

</details>

## 要点

- **拆炸弹影响为祖先链上的若干子树集合**：一个范围 $w$ 的炸弹在 $x$ 处爆炸，等价于沿 $x$ 的祖先链 $j=0,1,\dots,w$，在每个仍存在的祖先 $y=\text{fa}(x,j)$ 处给「$y$ 子树内距 $y$ 不超过 $w-j$」加一。这正是 $w\le 50$ 能被利用的地方：每个炸弹只走至多 $50$ 步父链。

- **树上差分抵消重复**：祖先 $y$ 处加的范围会把已经处理过的 $\text{fa}(x,j-1)$ 那一支重复计入，所以在 $\text{fa}(x,j-1)$ 处对「距它不超过 $w-j-1$」的范围减一。这样每个炸弹只产生 $O(w)$ 次单点修改，不需要真的去遍历子树。

- **状态定义与推导**：令 $f[x][i]$ 表示「$x$ 子树内距 $x$ 不超过 $i$ 的节点统一加的标记」。推导阶段自顶向下做 $f[x][i] \mathrel{+}= f[\text{parent}(x)][i+1]$（父处距父 $\le i+1$，对应子处距子 $\le i$），最后每个节点的答案为 $\sum_i f[x][i]$。

- **用 BFS 序替代递归**：$n$ 达到 $5\times 10^5$，递归 DFS 有栈溢出风险，改用 BFS 序数组，父先于子顺序遍历完成自顶向下的传播。

- **内存优化**：$f$ 数组规模 $5\times10^5\times51$，用 `Int32` 并扁平化为一维（`f[x*stride+i]`）存储，约 $102$ MB；邻接表也用 `head/to/nxt` 三个一维数组实现，避免 `ArrayList` 开销。
