---
oj: dmy
pid: '60'
title: '[R10F] 数字修改'
difficulty: 提高
tags:
  - 线段树
  - 仿射变换
  - 模运算
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 3 \times 10^5$，$0 \le a_i, b_i, x_i \le 10^9$。

## 思路

每次修改是一次仿射变换 $x \mapsto a_i x + b_i$。先做 $f$（参数 $c,d$）再做 $g$（参数 $e,f$）的复合为 $e(cd+d)+f = (ec)x + (ed+f)$，即新参数 $(ec,\, ed+f)$。仿射变换在保持相对顺序的前提下满足结合律，所以可以把一段区间的修改合并成一个等价的修改 $(A,B)$，对 $x$ 的最终结果就是 $A x + B$。

用线段树维护：每个节点存它所代表区间「从左到右依次合并」出的 $(a,b)$。两个子区间合并时，左子整体在先、右子整体在后，用上面的复合公式即可。叶子存单次修改，空段为单位元 $(1,0)$。查询 $[L,R]$ 得到合并后的 $(A,B)$，答案是 $A x_i + B \pmod{10^9+7}$。

注意 $a_i$ 可能是 $0$，因此不能依赖乘法逆元拆前缀积，但线段树的合并只用到乘法和加法，天然兼容 $a_i=0$。

复杂度：时间 $O(n + m\log n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

let MOD: Int64 = 1000000007

main(): Int64 {
    let reader = getStdIn()
    let l1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = l1[0]
    let m = l1[1]
    let aa = Array<Int64>(n + 1, { _ => 0 })
    let bb = Array<Int64>(n + 1, { _ => 0 })
    for (i in 1..=n) {
        let lr = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        aa[i] = lr[0]
        bb[i] = lr[1]
    }
    var sz: Int64 = 1
    while (sz < n) {
        sz *= 2
    }
    let N2 = sz
    let ta = Array<Int64>(2 * N2, { _ => 1 })
    let tb = Array<Int64>(2 * N2, { _ => 0 })
    for (i in 1..=n) {
        ta[N2 + i - 1] = aa[i] % MOD
        tb[N2 + i - 1] = bb[i] % MOD
    }
    var p = N2 - 1
    while (p >= 1) {
        let la = ta[2 * p]
        let lb = tb[2 * p]
        let ra = ta[2 * p + 1]
        let rb = tb[2 * p + 1]
        ta[p] = ra * la % MOD
        tb[p] = (ra * lb % MOD + rb) % MOD
        p -= 1
    }
    func q(node: Int64, nl: Int64, nr: Int64, ql: Int64, qr: Int64): (Int64, Int64) {
        if (qr < nl || nr < ql) {
            return (1, 0)
        }
        if (ql <= nl && nr <= qr) {
            return (ta[node], tb[node])
        }
        let mid = (nl + nr) / 2
        let (la, lb) = q(2 * node, nl, mid, ql, qr)
        let (ra, rb) = q(2 * node + 1, mid + 1, nr, ql, qr)
        return (ra * la % MOD, (ra * lb % MOD + rb) % MOD)
    }
    for (_ in 0..m) {
        let lr = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        let x = lr[0] % MOD
        let L = lr[1]
        let R = lr[2]
        let (A, B) = q(1, 1, N2, L, R)
        let ans = (A * x % MOD + B) % MOD
        println(ans)
    }
    return 0
}
```

要点：

- 仿射变换 $x\mapsto ax+b$ 在保持相对顺序时可结合，于是区间复合可上线段树，避免对前缀积求逆。
- 合并两个子区间时务必按「左先右后」的顺序：新 $a = $ 右 $a\,\times\,$ 左 $a$，新 $b = $ 右 $a\,\times\,$ 左 $b + $ 右 $b$。
