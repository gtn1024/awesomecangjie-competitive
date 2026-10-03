---
oj: dmy
pid: '365'
title: '[R58F] 回路'
difficulty: 提高+/省选-
tags:
  - 构造
  - 图论
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^6$。

## 思路

设城市 $i$ 选择的传送门为 $c_i \in \{0, 1\}$（0 为 A、1 为 B），则它传送到 $p(i) \equiv 2i + c_i \pmod n$。要求回路恰好访问每个城市一次并回到 0，即 $p$ 必须是包含全部城市的单一循环置换。

**$n$ 为奇数时无解。** 因为 $p$ 是置换，$\sum_i p(i) \equiv \sum_i i \pmod n$；又 $p(i) \equiv 2i + c_i$，故 $\sum_i c_i \equiv -\sum_i i \pmod n$。$n$ 为奇数时 $\sum_i i = \frac{n(n-1)}{2}$ 被 $n$ 整除，所以 $\sum_i c_i \equiv 0 \pmod n$，而 $0 \le \sum c_i \le n$，只能全为 0 或全为 1：全为 0 时 $p(0) = 0$ 是不动点；全为 1 时 $p(i) = 2i + 1$，$p(n-1) = 2n - 1 \equiv n - 1$ 也是不动点，均构不成单循环。$n = 1$ 是特例：回路 $[0]$ 本身成立。

**$n$ 为偶数 $n = 2m$ 时的构造。** 把城市 $i$ 与 $i + m$ 配成一对，记对编号 $u = i \bmod m$。注意到

$$
p(i) = 2 \cdot (i \bmod m) + c_i,
$$

即传送目标完全由对编号与传送门类型决定：走 A 到城市 $2u$，走 B 到城市 $2u + 1$（两者都在 $[0, 2m)$ 内，无需取模）；下一跳所在的对编号为 $(2u + c_i) \bmod m$。

由此构造有向图 $D$：顶点为对编号 $0 \sim m - 1$，每个顶点有两条出边 $u \to 2u \bmod m$（标签 A）与 $u \to (2u + 1) \bmod m$（标签 B）。关键观察：**边 $(u, d)$ 与城市值 $2u + d$ 一一对应**（$2u + d$ 对 $u \in [0, m)$、$d \in \{0, 1\}$ 恰好覆盖 $[0, 2m)$）。因此在 $D$ 上找一条每条边恰好使用一次的闭合回路（欧拉回路），按回路顺序走，城市值恰好全部出现一次——这就是所求回路，城市 $2u + d$ 走的传送门正是边 $(u, d)$ 的标签。

$D$ 每个顶点入度等于出度等于 2（城市 $y$ 的两个前驱为 $\lfloor y/2 \rfloor$ 与 $\lfloor y/2 \rfloor + m$），且强连通：从 0 出发先走 B 到 1，再不断走 A 翻倍，由可达集合含 $\{0, \ldots, r\}$ 可推出含 $\{0, \ldots, 2r + 1\}$，归纳得 0 可达所有顶点；反向每个顶点不断沿前驱 $\lfloor y/2 \rfloor$ 走可回到 0。故欧拉回路存在，用 Hierholzer 算法 $O(n)$ 求出。

最后处理闭合：欧拉回路必须闭合回城市 0。0 号对的两条出边中，自环 $0 \to 0$（走 A）产生的城市值为 0，恰好是起点；把欧拉回路旋转，使这条自环边成为最后一条边即可。旋转后按边序填答案即可，回路本身是哈密顿回路，$p$ 自动成为置换，无需额外验证两城市传送门的互补性。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })[0]
    if (n == 1) {
        println("YES")
        println("A")
        return 0
    }
    if (n % 2 == 1) {
        println("NO")
        return 0
    }
    if (n == 2) {
        println("YES")
        println("BA")
        return 0
    }
    let m = n / 2
    let e = 2 * m
    // 城市 i 与 i+m 配成一对，转移只依赖对编号 u = i mod m：
    // 走 A 到城市 2u，走 B 到城市 2u+1，下一跳对编号为 (2u+d) mod m。
    // 在顶点 0..m-1、出边 u -> (2u+d) mod m (d=0,1) 的有向图 D 上求欧拉回路
    // （每个顶点入度=出度=2，Hierholzer 迭代版）。
    let ptr = Array<Int64>(m, { _ => 0 })
    let stack = Array<Int64>(e + 2, { _ => 0 })
    let circ = Array<Int64>(e + 2, { _ => 0 })
    var sp: Int64 = 1
    var cnt: Int64 = 0
    stack[0] = 0
    while (sp > 0) {
        let u = stack[sp - 1]
        if (ptr[u] < 2) {
            let d = ptr[u]
            ptr[u] = d + 1
            stack[sp] = (2 * u + d) % m
            sp = sp + 1
        } else {
            sp = sp - 1
            circ[cnt] = u
            cnt = cnt + 1
        }
    }
    // circ 是逆序顶点序列，正序为 f(k) = circ[cnt-1-k]。
    // 回路必须由自环 0->0（走 A）闭合，旋转欧拉回路使该边成为最后一条边。
    var j: Int64 = -1
    for (k in 0..e) {
        if (circ[cnt - 1 - k] == 0 && circ[cnt - 2 - k] == 0) {
            j = k
            break
        }
    }
    // 沿回路顺序填每个城市的传送门：边 (u -> (2u+d) mod m) 对应的城市值为 2u+d，
    // 城市 2u+d 走传送门 d，且每个城市值恰好对应一条边。
    let s = Array<UInt8>(n, { _ => UInt8(65) })
    var v: Int64 = 0
    for (k in 0..e) {
        let idx = (j + 1 + k) % e
        let u = circ[cnt - 1 - idx]
        let un = circ[cnt - 2 - idx]
        let d = if (un == (2 * u + 1) % m) { 1 } else { 0 }
        s[v] = if (d == 0) { UInt8(65) } else { UInt8(66) }
        v = 2 * u + d
    }
    println("YES")
    println(String.fromUtf8(s))
    return 0
}
```

</details>

要点：

- $n = 1$ 时回路 $[0]$ 成立，任选一个传送门；$n = 2$ 时对编号图退化为单顶点两条自环，无法区分标签，直接特判输出 `BA`。
- 若 $D$ 不旋转直接用 Hierholzer 结果，闭合边可能对应城市 $m$（即走回 $0$ 号对的高位城市），无法闭合回 0，必须把自环 $0 \to 0$ 旋转到最后一条边。
