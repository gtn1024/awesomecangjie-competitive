---
oj: dmy
pid: '261'
title: '[R42F]数组操作'
difficulty: 提高
tags:
  - 线段树
  - 懒标记
timeLimit: 1s
memoryLimit: 512m
---

## 题目

给定长度为 $n$ 的数组 $a$，处理 $q$ 次操作：

1.  `1 l r x y`：把区间 $[l,r]$ 内所有**等于** $x$ 的数改成 $y$。
2.  `2 l r`：查询区间 $[l,r]$ 内所有数之和。

> 对于 $100\%$ 的数据：$1\le n,q\le 10^5$，$1\le l\le r\le n$，$1\le a_i,x,y\le 20$。

## 思路

值域只有 $1\sim 20$，这是解题的关键。普通的区间赋值懒标记无法表达「只改等于 $x$ 的位置」这种条件赋值，但只要值域很小，就可以为每个节点额外维护一个**值域大小的计数数组**：

-   $\mathit{cnt}_u[v]$：节点 $u$ 对应区间内，当前实际值为 $v$ 的位置个数（$v=1,\dots,20$）。
-   $\mathit{sum}_u$：节点 $u$ 对应区间的元素之和。

有了 $\mathit{cnt}$，「把等于 $x$ 的位置改成 $y$」就是一个能在 $O(|\Sigma|)=O(20)$ 内完成、且**无须下传到叶子**的局部操作：把 $\mathit{cnt}_u[x]$ 搬到 $\mathit{cnt}_u[y]$，并把 $\mathit{sum}_u$ 增加 $\mathit{cnt}_u[x]\cdot(y-x)$。

### 懒标记：函数复合

难点在于「修改懒标记」。一个常见的懒标记写法是「把某一段统一改成某个值」，但它不能复合「条件赋值」。这里改用更一般的思路：**把懒标记定义成一个值域上的映射 $f: \{1,\dots,20\}\to\{1,\dots,20\}$**，含义是「这段区间里原值为 $v$ 的位置，现在应当被看作 $f(v)$」。恒等映射 $f(v)=v$ 表示没有待处理的修改。

-   修改操作「等于 $x$ 的改为 $y$」等价于把 $f$ 复合上一个外层映射 $g$，其中 $g(x)=y$、$g(v)=v\ (v\ne x)$。
-   把父节点的 $f$ 下传给子节点 $c$ 时，子节点的懒标记 $f_c$ 更新为复合 $f\circ f_c$（先做 $c$ 原来的映射，再做父节点带来的映射），同时按 $f$ 重排 $c$ 的计数数组、修正 $\mathit{sum}_c$。

两个映射复合仍然是 $O(|\Sigma|)$，因此整棵线段树的单次区间修改、查询都是 $O(|\Sigma|\log n)$。

### 一个容易踩的坑

懒标记数组 $f$ 必须**初始化成恒等映射** $f[v]=v$，而不是 $0$。否则一旦发生部分覆盖的修改并触发 `push` 下传，恒等映射被破坏，后续复合会把大量本应保持不变的值错误地映射到 $0$，结果完全错乱。本题样例恰好所有修改和查询都覆盖整个 $[1,n]$，`push` 不会被触发，所以即便 $f$ 初始化错了也能过样例——这也是最隐蔽的 bug。

## 复杂度

-   时间复杂度：$O\bigl((n+q)\cdot|\Sigma|\cdot\log n\bigr)$，其中 $|\Sigma|=20$。
-   空间复杂度：$O(n\cdot|\Sigma|)$，每个节点存 $|\Sigma|$ 个计数和一个 $|\Sigma|$ 的映射。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

// 线段树 + 懒标记：每个节点维护
//   sum[u]：区间实际和
//   cnt[u][v]：区间内实际值为 v 的位置数（v = 1..20）
//   f[u][v]：待下传的映射（原值 v 变为 f[u][v]），即「懒标记」
//   pend[u]：f[u] 是否为非恒等映射
class SegTree {
    var n: Int64
    var sum: Array<Int64>
    var cnt: Array<Int32>
    var f: Array<UInt8>
    var pend: Array<Bool>
    var tmp: Array<Int32>

    init(nn: Int64) {
        n = nn
        let m = 4 * nn + 5
        sum = Array<Int64>(m, { _ => 0 })
        cnt = Array<Int32>(m * 21, { _ => 0 })
        // 懒映射 f[u*21 + v] 表示「原值 v 当前应映射到的值」，初始化必须为恒等映射
        f = Array<UInt8>(m * 21, { i: Int64 => UInt8(i % 21) })
        pend = Array<Bool>(m, { _ => false })
        tmp = Array<Int32>(21, { _ => 0 })
    }

    func build(u: Int64, L: Int64, R: Int64, a: Array<Int64>): Unit {
        if (L == R) {
            let v = a[L - 1]
            cnt[u * 21 + v] = 1
            sum[u] = v
            return
        }
        let mid = (L + R) / 2
        build(u * 2, L, mid, a)
        build(u * 2 + 1, mid + 1, R, a)
        pull(u)
    }

    // 用两个儿子重算 cnt[u]、sum[u]（此时 u 的懒标记必须已清空）
    func pull(u: Int64): Unit {
        let b1 = u * 42
        let b2 = u * 42 + 21
        let bu = u * 21
        var s: Int64 = 0
        for (v in 1..21) {
            let t = cnt[b1 + v] + cnt[b2 + v]
            cnt[bu + v] = t
            s += Int64(t) * v
        }
        sum[u] = s
    }

    // 把懒映射 f[u] 应用到两个儿子
    func push(u: Int64): Unit {
        if (!pend[u]) {
            return
        }
        let base = u * 21
        pushTo(u * 2, base)
        pushTo(u * 2 + 1, base)
        for (v in 1..21) {
            f[base + v] = UInt8(v)
        }
        pend[u] = false
    }

    // 把映射 f[fbase..] 应用到节点 c（同时把映射复合进 c 的懒标记）
    func pushTo(c: Int64, fbase: Int64): Unit {
        for (i in 1..21) {
            tmp[i] = 0
        }
        let cbase = c * 21
        var delta: Int64 = 0
        for (w in 1..21) {
            let t = cnt[cbase + w]
            let fw = f[fbase + w]
            if (t != 0) {
                let nv = Int64(fw)
                tmp[nv] += t
                delta += Int64(t) * (nv - w)
            }
            let fcv = f[cbase + w]
            f[cbase + w] = f[fbase + Int64(fcv)]
        }
        for (v in 1..21) {
            cnt[cbase + v] = tmp[v]
        }
        sum[c] += delta
        pend[c] = true
    }

    // 区间内所有等于 x 的改为 y（调用前保证 x != y）
    func move(u: Int64, x: Int64, y: Int64): Unit {
        let base = u * 21
        let m = cnt[base + x]
        if (m == 0) {
            return
        }
        cnt[base + x] = 0
        cnt[base + y] += m
        sum[u] += Int64(m) * (y - x)
        for (v in 1..21) {
            if (Int64(f[base + v]) == x) {
                f[base + v] = UInt8(y)
            }
        }
        pend[u] = true
    }

    func update(u: Int64, L: Int64, R: Int64, ql: Int64, qr: Int64, x: Int64, y: Int64): Unit {
        if (ql <= L && R <= qr) {
            move(u, x, y)
            return
        }
        push(u)
        let mid = (L + R) / 2
        if (ql <= mid) {
            update(u * 2, L, mid, ql, qr, x, y)
        }
        if (qr > mid) {
            update(u * 2 + 1, mid + 1, R, ql, qr, x, y)
        }
        pull(u)
    }

    func query(u: Int64, L: Int64, R: Int64, ql: Int64, qr: Int64): Int64 {
        if (ql <= L && R <= qr) {
            return sum[u]
        }
        push(u)
        let mid = (L + R) / 2
        var s: Int64 = 0
        if (ql <= mid) {
            s += query(u * 2, L, mid, ql, qr)
        }
        if (qr > mid) {
            s += query(u * 2 + 1, mid + 1, R, ql, qr)
        }
        return s
    }
}

main() {
    let reader = getStdIn()
    let line1 = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(line1[0])
    let q = Int64.parse(line1[1])
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let st = SegTree(n)
    st.build(1, 1, n, a)
    for (_ in 0..q) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let t = Int64.parse(parts[0])
        if (t == 1) {
            let l = Int64.parse(parts[1])
            let r = Int64.parse(parts[2])
            let x = Int64.parse(parts[3])
            let y = Int64.parse(parts[4])
            if (x != y) {
                st.update(1, 1, n, l, r, x, y)
            }
        } else {
            let l = Int64.parse(parts[1])
            let r = Int64.parse(parts[2])
            println(st.query(1, 1, n, l, r))
        }
    }
}
```

</details>
