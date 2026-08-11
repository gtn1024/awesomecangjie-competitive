---
oj: dmy
pid: '191'
title: '[R31F]矩形求和2'
difficulty: 提高+
tags:
  - 位运算
  - 前缀和
  - 分治
timeLimit: 2.5s
memoryLimit: 512m
---

> 数据规模：$n \le 20$，$Q \le 2 \times 10^5$，$0 \le f[i], v < 998244353$，矩形坐标都在 $[0, 2^n)$ 内。

## 思路

**前缀化**：设 $G(a, b) = \sum_{i < a} \sum_{j < b} W_{i, j}$，即矩阵左上角 $a \times b$ 的子矩阵和。则矩形 $[x_1, x_2] \times [y_1, y_2]$ 的答案用容斥：

$$G(x_2+1, y_2+1) - G(x_1, y_2+1) - G(x_2+1, y_1) + G(x_1, y_1)$$

**按位递归算 $G(a, b)$**：把下标看成 $n$ 位二进制数，从最高位逐层划分。当前层处理 $[0, 2^\ell)$，令 $h = 2^{\ell - 1}$，左右两半的 $f$ 和记为 $tot_L, tot_R$（$i \oplus j$ 最高位为 $0$ 用 $tot_L$，为 $1$ 用 $tot_R$）：

- $a \le h$ 且 $b \le h$：所有异或的最高位都是 $0$，递归进左半。
- $a \le h < b$：$j < h$ 的部分贡献 $a \cdot tot_L$（$j$ 取满左半时 $i \oplus j$ 遍历整个左半）；$j \ge h$ 的部分把 $j$ 减 $h$ 后递归进右半。
- $b \le h < a$：对称，贡献 $b \cdot tot_L$，$i$ 减 $h$ 后递归进右半。
- $a, b > h$：同半的 $(i, j)$ 两两块贡献 $h \cdot tot_L$，异半的两块贡献 $(b - h) \cdot tot_R + (a - h) \cdot tot_R$，最后 $a, b$ 各减 $h$ 后递归进左半。

递归只有一条长度为 $n$ 的路径，每层 $O(1)$，所以单个 $G$ 是 $O(n)$。这本质上是二叉 trie 上的数字 DP。

**数据结构**：把 $f$ 放进完全二叉树的堆式存储（下标 $2^n + i$ 是叶子，内部节点存子树和，均模 $998244353$）。修改 $f_i \mathrel{+}= v$ 时沿祖先链逐个加 $v$；查询 $G$ 时按上面的规则取左右子树和即可。

## 复杂度

时间 $O(Q \cdot n)$（修改 $O(n)$，查询 $O(n)$），空间 $O(2^n)$。$n = 20$ 时节点数 $2^{n+1} \approx 2 \times 10^6$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

const MOD: Int64 = 998244353

// G(a, b) = sum_{i < a, j < b} f[i xor j]，模 MOD。
// 用二叉 trie（完全二叉树，堆式存储）上的按位递归计算，每层 O(1)。
func g(a0: Int64, b0: Int64, n: Int64, tot: Array<Int64>): Int64 {
    if (a0 == 0 || b0 == 0) {
        return 0
    }
    var a = a0
    var b = b0
    var node: Int64 = 1
    var ans: Int64 = 0
    var level = n
    while (level > 0) {
        let half: Int64 = 1 << (level - 1)
        let aHi = a > half
        let bHi = b > half
        if (aHi && bHi) {
            let totL = tot[node * 2]
            let totR = tot[node * 2 + 1]
            ans = (ans + half * totL) % MOD
            let bh = (b - half) % MOD
            let ah = (a - half) % MOD
            ans = (ans + bh * totR) % MOD
            ans = (ans + ah * totR) % MOD
            a = a - half
            b = b - half
            node = node * 2
        } else if (aHi) {
            let totL = tot[node * 2]
            ans = (ans + (b % MOD) * totL) % MOD
            a = a - half
            node = node * 2 + 1
        } else if (bHi) {
            let totL = tot[node * 2]
            ans = (ans + (a % MOD) * totL) % MOD
            b = b - half
            node = node * 2 + 1
        } else {
            node = node * 2
        }
        level = level - 1
    }
    ans = (ans + tot[node]) % MOD
    return ans
}

main(): Int64 {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = head[0]
    let Q = head[1]
    let size: Int64 = 1 << n
    let tot = Array<Int64>(2 * size, { _ => 0 })
    let fv = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    for (i in 0..size) {
        tot[size + i] = fv[i] % MOD
    }
    var k = size - 1
    while (k >= 1) {
        tot[k] = (tot[k * 2] + tot[k * 2 + 1]) % MOD
        k = k - 1
    }
    let sb = StringBuilder()
    for (_ in 0..Q) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        if (parts[0] == "1") {
            let i = Int64.parse(parts[1])
            let v = Int64.parse(parts[2]) % MOD
            var node = size + i
            while (node >= 1) {
                tot[node] = (tot[node] + v) % MOD
                node = node / 2
            }
        } else {
            let x1 = Int64.parse(parts[1])
            let y1 = Int64.parse(parts[2])
            let x2 = Int64.parse(parts[3])
            let y2 = Int64.parse(parts[4])
            var r = (g(x2 + 1, y2 + 1, n, tot) - g(x1, y2 + 1, n, tot) - g(x2 + 1, y1, n, tot) + g(x1, y1, n, tot)) % MOD
            if (r < 0) {
                r = r + MOD
            }
            sb.append(r)
            sb.append("\n")
        }
    }
    print(sb.toString())
    return 0
}
```
